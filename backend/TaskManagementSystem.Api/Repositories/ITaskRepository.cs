using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Repositories;

public interface ITaskRepository : IRepository<TaskItem>
{
    Task<List<TaskItem>> GetFilteredAsync(int? projectId, int? statusId, TaskPriority? priority);
    Task<TaskItem?> GetByIdWithDetailsAsync(int id);
    Task SyncTagsAsync(TaskItem task, IReadOnlyList<int>? tagIds);
}
