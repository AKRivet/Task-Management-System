using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class WorkItemService : IWorkItemService
{
    private readonly IWorkItemRepository _workItems;
    private readonly IRepository<Project> _projects;
    private readonly IRepository<User> _users;
    private readonly IRepository<Status> _statuses;
    private readonly IRepository<Tag> _tags;
    private readonly IProjectAccessService _access;

    public WorkItemService(
        IWorkItemRepository workItems,
        IRepository<Project> projects,
        IRepository<User> users,
        IRepository<Status> statuses,
        IRepository<Tag> tags,
        IProjectAccessService access)
    {
        _workItems = workItems;
        _projects = projects;
        _users = users;
        _statuses = statuses;
        _tags = tags;
        _access = access;
    }

    public async Task<List<WorkItemResponse>> GetFilteredAsync(WorkItemFilter filter)
    {
        if (filter.ProjectId.HasValue)
        {
            await _access.EnsureAccessAsync(filter.ProjectId.Value);
        }
        else if (filter.ParentWorkItemId.HasValue)
        {
            var parent = await _workItems.GetByIdAsync(filter.ParentWorkItemId.Value)
                ?? throw AppException.NotFound($"Work item {filter.ParentWorkItemId.Value} not found.");
            await _access.EnsureAccessAsync(parent.ProjectId);
        }

        var workItems = await _workItems.GetFilteredAsync(filter);

        // Neither a project nor a parent was specified, so this is an
        // unscoped query — restrict it to projects the caller can see.
        if (!filter.ProjectId.HasValue && !filter.ParentWorkItemId.HasValue)
        {
            var accessibleIds = await _access.GetAccessibleProjectIdsAsync();
            if (accessibleIds is not null)
                workItems = workItems.Where(w => accessibleIds.Contains(w.ProjectId)).ToList();
        }

        return workItems.Select(ToResponse).ToList();
    }

    public async Task<WorkItemResponse> GetByIdAsync(int id)
    {
        var workItem = await _workItems.GetByIdWithDetailsAsync(id)
            ?? throw AppException.NotFound($"Work item {id} not found.");
        await _access.EnsureAccessAsync(workItem.ProjectId);
        return ToResponse(workItem);
    }

    public async Task<WorkItemResponse> CreateAsync(CreateWorkItemRequest request)
    {
        await EnsureProjectExists(request.ProjectId);
        await _access.EnsureAccessAsync(request.ProjectId);
        await EnsureStatusExists(request.StatusId);
        if (request.AssignedUserId.HasValue)
            await EnsureUserExists(request.AssignedUserId.Value);
        await EnsureTagsExist(request.TagIds);
        await EnsureParentValid(request.ParentWorkItemId, request.ProjectId, excludeId: null);

        var workItem = new WorkItem
        {
            Title = request.Title,
            Description = request.Description,
            Type = request.Type,
            ProjectId = request.ProjectId,
            AssignedUserId = request.AssignedUserId,
            StatusId = request.StatusId,
            Priority = request.Priority,
            ParentWorkItemId = request.ParentWorkItemId,
            DueDate = request.DueDate,
        };
        await _workItems.AddAsync(workItem);
        await _workItems.SaveChangesAsync(); // need workItem.Id assigned before linking tags

        await _workItems.SyncTagsAsync(workItem, request.TagIds);
        await _workItems.SaveChangesAsync();

        var created = await _workItems.GetByIdWithDetailsAsync(workItem.Id);
        return ToResponse(created!);
    }

    public async Task<WorkItemResponse> UpdateAsync(int id, UpdateWorkItemRequest request)
    {
        var workItem = await _workItems.GetByIdWithDetailsAsync(id)
            ?? throw AppException.NotFound($"Work item {id} not found.");
        await _access.EnsureAccessAsync(workItem.ProjectId);

        await EnsureStatusExists(request.StatusId);
        if (request.AssignedUserId.HasValue)
            await EnsureUserExists(request.AssignedUserId.Value);
        await EnsureTagsExist(request.TagIds);
        await EnsureParentValid(request.ParentWorkItemId, workItem.ProjectId, excludeId: id);

        workItem.Title = request.Title;
        workItem.Description = request.Description;
        workItem.Type = request.Type;
        workItem.AssignedUserId = request.AssignedUserId;
        workItem.StatusId = request.StatusId;
        workItem.Priority = request.Priority;
        workItem.ParentWorkItemId = request.ParentWorkItemId;
        workItem.DueDate = request.DueDate;
        workItem.UpdatedAt = DateTimeOffset.UtcNow;

        await _workItems.SyncTagsAsync(workItem, request.TagIds);
        await _workItems.SaveChangesAsync();

        var updated = await _workItems.GetByIdWithDetailsAsync(id);
        return ToResponse(updated!);
    }

    public async Task DeleteAsync(int id)
    {
        var workItem = await _workItems.GetByIdAsync(id) ?? throw AppException.NotFound($"Work item {id} not found.");
        await _access.EnsureAccessAsync(workItem.ProjectId);
        _workItems.Remove(workItem);
        await _workItems.SaveChangesAsync();
    }

    private async Task EnsureProjectExists(int projectId)
    {
        if (await _projects.GetByIdAsync(projectId) is null)
            throw AppException.NotFound($"Project {projectId} not found.");
    }

    private async Task EnsureStatusExists(int statusId)
    {
        if (await _statuses.GetByIdAsync(statusId) is null)
            throw AppException.NotFound($"Status {statusId} not found.");
    }

    private async Task EnsureUserExists(int userId)
    {
        if (await _users.GetByIdAsync(userId) is null)
            throw AppException.NotFound($"User {userId} not found.");
    }

    private async Task EnsureTagsExist(IReadOnlyList<int>? tagIds)
    {
        if (tagIds is null || tagIds.Count == 0) return;

        var distinctIds = tagIds.Distinct().ToList();
        var foundCount = await _tags.Query().CountAsync(t => distinctIds.Contains(t.Id));
        if (foundCount != distinctIds.Count)
            throw AppException.BadRequest("One or more tag IDs do not exist.");
    }

    // A parent must be a real work item in the same project, and setting it
    // must not create a cycle (an item can't become its own ancestor).
    private async Task EnsureParentValid(int? parentWorkItemId, int projectId, int? excludeId)
    {
        if (!parentWorkItemId.HasValue) return;

        if (parentWorkItemId.Value == excludeId)
            throw AppException.BadRequest("A work item cannot be its own parent.");

        var parent = await _workItems.GetByIdAsync(parentWorkItemId.Value)
            ?? throw AppException.NotFound($"Work item {parentWorkItemId.Value} not found.");

        if (parent.ProjectId != projectId)
            throw AppException.BadRequest("A parent work item must be in the same project.");

        var current = parent;
        var guard = 0;
        while (current?.ParentWorkItemId is not null && guard++ < 100)
        {
            if (current.ParentWorkItemId.Value == excludeId)
                throw AppException.BadRequest("This would create a circular parent/child relationship.");
            current = await _workItems.GetByIdAsync(current.ParentWorkItemId.Value);
        }
    }

    private static WorkItemResponse ToResponse(WorkItem w) => new(
        w.Id,
        w.Title,
        w.Description,
        w.Type,
        w.ProjectId,
        w.AssignedUserId,
        w.AssignedUser?.Name,
        w.StatusId,
        w.Status?.Name ?? string.Empty,
        w.Priority,
        w.ParentWorkItemId,
        w.Parent?.Title,
        w.Children?.Count ?? 0,
        w.DueDate,
        w.CreatedAt,
        w.UpdatedAt,
        w.WorkItemTags.Select(wt => new TagResponse(wt.Tag.Id, wt.Tag.Name)).ToList()
    );
}
