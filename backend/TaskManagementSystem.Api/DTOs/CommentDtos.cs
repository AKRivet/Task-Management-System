namespace TaskManagementSystem.Api.DTOs;

public record CommentResponse(int Id, int TaskId, int UserId, string UserName, string Body, DateTimeOffset CreatedAt);

public record CreateCommentRequest(int UserId, string Body);
