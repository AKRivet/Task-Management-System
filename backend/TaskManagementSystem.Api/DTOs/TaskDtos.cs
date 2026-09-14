using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.DTOs;

public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    int ProjectId,
    int? AssignedUserId,
    string? AssignedUserName,
    int StatusId,
    string StatusName,
    TaskPriority Priority,
    DateOnly? DueDate,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<TagResponse> Tags
);

public record CreateTaskRequest(
    string Title,
    string? Description,
    int ProjectId,
    int? AssignedUserId,
    int StatusId,
    TaskPriority Priority,
    DateOnly? DueDate,
    IReadOnlyList<int>? TagIds
);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    int? AssignedUserId,
    int StatusId,
    TaskPriority Priority,
    DateOnly? DueDate,
    IReadOnlyList<int>? TagIds
);
