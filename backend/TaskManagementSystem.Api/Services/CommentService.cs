using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _comments;
    private readonly IWorkItemRepository _workItems;
    private readonly IRepository<User> _users;
    private readonly IProjectAccessService _access;

    public CommentService(ICommentRepository comments, IWorkItemRepository workItems, IRepository<User> users, IProjectAccessService access)
    {
        _comments = comments;
        _workItems = workItems;
        _users = users;
        _access = access;
    }

    public async Task<List<CommentResponse>> GetByWorkItemIdAsync(int workItemId)
    {
        await EnsureAccessibleWorkItemAsync(workItemId);
        var comments = await _comments.GetByWorkItemIdAsync(workItemId);
        return comments.Select(ToResponse).ToList();
    }

    public async Task<CommentResponse> CreateAsync(int workItemId, CreateCommentRequest request)
    {
        await EnsureAccessibleWorkItemAsync(workItemId);

        var user = await _users.GetByIdAsync(request.UserId)
            ?? throw AppException.NotFound($"User {request.UserId} not found.");

        var comment = new Comment { WorkItemId = workItemId, UserId = request.UserId, Body = request.Body };
        await _comments.AddAsync(comment);
        await _comments.SaveChangesAsync();

        comment.User = user;
        return ToResponse(comment);
    }

    private async Task EnsureAccessibleWorkItemAsync(int workItemId)
    {
        var workItem = await _workItems.GetByIdAsync(workItemId)
            ?? throw AppException.NotFound($"Work item {workItemId} not found.");
        await _access.EnsureAccessAsync(workItem.ProjectId);
    }

    private static CommentResponse ToResponse(Comment c) =>
        new(c.Id, c.WorkItemId, c.UserId, c.User?.Name ?? string.Empty, c.Body, c.CreatedAt);
}
