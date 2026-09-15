using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface IProjectService
{
    Task<PagedResult<ProjectResponse>> GetPagedAsync(ProjectQuery query);
    Task<ProjectResponse> GetByIdAsync(int id);
    Task<ProjectResponse> CreateAsync(CreateProjectRequest request);
    Task<ProjectResponse> UpdateAsync(int id, UpdateProjectRequest request);
    Task DeleteAsync(int id);
}
