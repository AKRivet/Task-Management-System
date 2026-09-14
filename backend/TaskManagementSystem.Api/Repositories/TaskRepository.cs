using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Data;
using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Repositories;

public class TaskRepository : Repository<TaskItem>, ITaskRepository
{
    public TaskRepository(AppDbContext context) : base(context)
    {
    }

    private IQueryable<TaskItem> WithDetails() =>
        DbSet
            .Include(t => t.Project)
            .Include(t => t.AssignedUser)
            .Include(t => t.Status)
            .Include(t => t.TaskTags).ThenInclude(tt => tt.Tag);

    public async Task<List<TaskItem>> GetFilteredAsync(int? projectId, int? statusId, TaskPriority? priority)
    {
        var query = WithDetails();

        if (projectId.HasValue)
            query = query.Where(t => t.ProjectId == projectId.Value);
        if (statusId.HasValue)
            query = query.Where(t => t.StatusId == statusId.Value);
        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
    }

    public async Task<TaskItem?> GetByIdWithDetailsAsync(int id) =>
        await WithDetails().FirstOrDefaultAsync(t => t.Id == id);

    public Task SyncTagsAsync(TaskItem task, IReadOnlyList<int>? tagIds)
    {
        tagIds ??= Array.Empty<int>();

        var toRemove = task.TaskTags.Where(tt => !tagIds.Contains(tt.TagId)).ToList();
        foreach (var tt in toRemove)
            task.TaskTags.Remove(tt);

        var existingTagIds = task.TaskTags.Select(tt => tt.TagId).ToHashSet();
        foreach (var tagId in tagIds.Where(id => !existingTagIds.Contains(id)))
        {
            task.TaskTags.Add(new TaskTag { TaskId = task.Id, TagId = tagId });
        }

        return Task.CompletedTask;
    }
}
