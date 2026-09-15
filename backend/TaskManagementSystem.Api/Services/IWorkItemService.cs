using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface IWorkItemService
{
    Task<List<WorkItemResponse>> GetFilteredAsync(WorkItemFilter filter);
    Task<WorkItemResponse> GetByIdAsync(int id);
    Task<WorkItemResponse> CreateAsync(CreateWorkItemRequest request);
    Task<WorkItemResponse> UpdateAsync(int id, UpdateWorkItemRequest request);
    Task DeleteAsync(int id);
}
