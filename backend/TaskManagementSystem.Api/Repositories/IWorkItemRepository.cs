using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Repositories;

public interface IWorkItemRepository : IRepository<WorkItem>
{
    Task<List<WorkItem>> GetFilteredAsync(WorkItemFilter filter);
    Task<WorkItem?> GetByIdWithDetailsAsync(int id);
    Task SyncTagsAsync(WorkItem workItem, IReadOnlyList<int>? tagIds);
}
