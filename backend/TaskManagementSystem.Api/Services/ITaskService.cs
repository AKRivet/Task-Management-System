using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Services;

public interface ITaskService
{
    Task<List<TaskResponse>> GetFilteredAsync(int? projectId, int? statusId, TaskPriority? priority);
    Task<TaskResponse> GetByIdAsync(int id);
    Task<TaskResponse> CreateAsync(CreateTaskRequest request);
    Task<TaskResponse> UpdateAsync(int id, UpdateTaskRequest request);
    Task DeleteAsync(int id);
}
