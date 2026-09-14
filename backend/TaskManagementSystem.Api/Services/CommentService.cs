using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _comments;
    private readonly ITaskRepository _tasks;
    private readonly IRepository<User> _users;

    public CommentService(ICommentRepository comments, ITaskRepository tasks, IRepository<User> users)
    {
        _comments = comments;
        _tasks = tasks;
        _users = users;
    }

    public async Task<List<CommentResponse>> GetByTaskIdAsync(int taskId)
    {
        await EnsureTaskExists(taskId);
        var comments = await _comments.GetByTaskIdAsync(taskId);
        return comments.Select(ToResponse).ToList();
    }

    public async Task<CommentResponse> CreateAsync(int taskId, CreateCommentRequest request)
    {
        await EnsureTaskExists(taskId);

        var user = await _users.GetByIdAsync(request.UserId)
            ?? throw AppException.NotFound($"User {request.UserId} not found.");

        var comment = new Comment { TaskId = taskId, UserId = request.UserId, Body = request.Body };
        await _comments.AddAsync(comment);
        await _comments.SaveChangesAsync();

        comment.User = user;
        return ToResponse(comment);
    }

    private async Task EnsureTaskExists(int taskId)
    {
        if (await _tasks.GetByIdAsync(taskId) is null)
            throw AppException.NotFound($"Task {taskId} not found.");
    }

    private static CommentResponse ToResponse(Comment c) =>
        new(c.Id, c.TaskId, c.UserId, c.User?.Name ?? string.Empty, c.Body, c.CreatedAt);
}
