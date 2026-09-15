using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface ICommentService
{
    Task<List<CommentResponse>> GetByWorkItemIdAsync(int workItemId);
    Task<CommentResponse> CreateAsync(int workItemId, CreateCommentRequest request);
}
