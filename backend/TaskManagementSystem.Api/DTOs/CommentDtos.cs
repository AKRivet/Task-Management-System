namespace TaskManagementSystem.Api.DTOs;

public record CommentResponse(int Id, int WorkItemId, int UserId, string UserName, string Body, DateTimeOffset CreatedAt);

public record CreateCommentRequest(int UserId, string Body);
