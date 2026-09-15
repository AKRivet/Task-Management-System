using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Data;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Repositories;

public class WorkItemRepository : Repository<WorkItem>, IWorkItemRepository
{
    public WorkItemRepository(AppDbContext context) : base(context)
    {
    }

    private IQueryable<WorkItem> WithDetails() =>
        DbSet
            .Include(w => w.Project)
            .Include(w => w.AssignedUser)
            .Include(w => w.Status)
            .Include(w => w.Parent)
            .Include(w => w.Children)
            .Include(w => w.WorkItemTags).ThenInclude(wt => wt.Tag)
            .AsSplitQuery();

    public async Task<List<WorkItem>> GetFilteredAsync(WorkItemFilter filter)
    {
        var query = WithDetails();

        if (filter.ProjectId.HasValue)
            query = query.Where(w => w.ProjectId == filter.ProjectId.Value);
        if (filter.StatusId.HasValue)
            query = query.Where(w => w.StatusId == filter.StatusId.Value);
        if (filter.Priority.HasValue)
            query = query.Where(w => w.Priority == filter.Priority.Value);
        if (filter.Type.HasValue)
            query = query.Where(w => w.Type == filter.Type.Value);
        if (filter.ParentWorkItemId.HasValue)
            query = query.Where(w => w.ParentWorkItemId == filter.ParentWorkItemId.Value);
        if (filter.TopLevelOnly)
            query = query.Where(w => w.ParentWorkItemId == null);
        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(w => EF.Functions.ILike(w.Title, $"%{filter.Search}%"));

        return await query.OrderByDescending(w => w.CreatedAt).ToListAsync();
    }

    public async Task<WorkItem?> GetByIdWithDetailsAsync(int id) =>
        await WithDetails().FirstOrDefaultAsync(w => w.Id == id);

    public Task SyncTagsAsync(WorkItem workItem, IReadOnlyList<int>? tagIds)
    {
        tagIds ??= Array.Empty<int>();

        var toRemove = workItem.WorkItemTags.Where(wt => !tagIds.Contains(wt.TagId)).ToList();
        foreach (var wt in toRemove)
            workItem.WorkItemTags.Remove(wt);

        var existingTagIds = workItem.WorkItemTags.Select(wt => wt.TagId).ToHashSet();
        foreach (var tagId in tagIds.Where(id => !existingTagIds.Contains(id)))
        {
            workItem.WorkItemTags.Add(new WorkItemTag { WorkItemId = workItem.Id, TagId = tagId });
        }

        return Task.CompletedTask;
    }
}
