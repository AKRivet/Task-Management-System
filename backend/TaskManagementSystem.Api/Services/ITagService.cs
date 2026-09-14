using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface ITagService
{
    Task<List<TagResponse>> GetAllAsync();
    Task<TagResponse> CreateAsync(CreateTagRequest request);
    Task DeleteAsync(int id);
}
