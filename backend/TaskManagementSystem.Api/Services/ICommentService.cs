using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface ICommentService
{
    Task<List<CommentResponse>> GetByTaskIdAsync(int taskId);
    Task<CommentResponse> CreateAsync(int taskId, CreateCommentRequest request);
}
