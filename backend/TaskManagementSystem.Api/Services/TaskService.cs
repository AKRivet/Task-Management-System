using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _tasks;
    private readonly IRepository<Project> _projects;
    private readonly IRepository<User> _users;
    private readonly IRepository<Status> _statuses;
    private readonly IRepository<Tag> _tags;

    public TaskService(
        ITaskRepository tasks,
        IRepository<Project> projects,
        IRepository<User> users,
        IRepository<Status> statuses,
        IRepository<Tag> tags)
    {
        _tasks = tasks;
        _projects = projects;
        _users = users;
        _statuses = statuses;
        _tags = tags;
    }

    public async Task<List<TaskResponse>> GetFilteredAsync(int? projectId, int? statusId, TaskPriority? priority)
    {
        var tasks = await _tasks.GetFilteredAsync(projectId, statusId, priority);
        return tasks.Select(ToResponse).ToList();
    }

    public async Task<TaskResponse> GetByIdAsync(int id)
    {
        var task = await _tasks.GetByIdWithDetailsAsync(id) ?? throw AppException.NotFound($"Task {id} not found.");
        return ToResponse(task);
    }

    public async Task<TaskResponse> CreateAsync(CreateTaskRequest request)
    {
        await EnsureProjectExists(request.ProjectId);
        await EnsureStatusExists(request.StatusId);
        if (request.AssignedUserId.HasValue)
            await EnsureUserExists(request.AssignedUserId.Value);
        await EnsureTagsExist(request.TagIds);

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            ProjectId = request.ProjectId,
            AssignedUserId = request.AssignedUserId,
            StatusId = request.StatusId,
            Priority = request.Priority,
            DueDate = request.DueDate,
        };
        await _tasks.AddAsync(task);
        await _tasks.SaveChangesAsync(); // need task.Id assigned before linking tags

        await _tasks.SyncTagsAsync(task, request.TagIds);
        await _tasks.SaveChangesAsync();

        var created = await _tasks.GetByIdWithDetailsAsync(task.Id);
        return ToResponse(created!);
    }

    public async Task<TaskResponse> UpdateAsync(int id, UpdateTaskRequest request)
    {
        var task = await _tasks.GetByIdWithDetailsAsync(id) ?? throw AppException.NotFound($"Task {id} not found.");

        await EnsureStatusExists(request.StatusId);
        if (request.AssignedUserId.HasValue)
            await EnsureUserExists(request.AssignedUserId.Value);
        await EnsureTagsExist(request.TagIds);

        task.Title = request.Title;
        task.Description = request.Description;
        task.AssignedUserId = request.AssignedUserId;
        task.StatusId = request.StatusId;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;
        task.UpdatedAt = DateTimeOffset.UtcNow;

        await _tasks.SyncTagsAsync(task, request.TagIds);
        await _tasks.SaveChangesAsync();

        var updated = await _tasks.GetByIdWithDetailsAsync(id);
        return ToResponse(updated!);
    }

    public async Task DeleteAsync(int id)
    {
        var task = await _tasks.GetByIdAsync(id) ?? throw AppException.NotFound($"Task {id} not found.");
        _tasks.Remove(task);
        await _tasks.SaveChangesAsync();
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

    private static TaskResponse ToResponse(TaskItem t) => new(
        t.Id,
        t.Title,
        t.Description,
        t.ProjectId,
        t.AssignedUserId,
        t.AssignedUser?.Name,
        t.StatusId,
        t.Status?.Name ?? string.Empty,
        t.Priority,
        t.DueDate,
        t.CreatedAt,
        t.UpdatedAt,
        t.TaskTags.Select(tt => new TagResponse(tt.Tag.Id, tt.Tag.Name)).ToList()
    );
}
