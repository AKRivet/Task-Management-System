using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.DTOs;

public record WorkItemResponse(
    int Id,
    string Title,
    string? Description,
    WorkItemType Type,
    int ProjectId,
    int? AssignedUserId,
    string? AssignedUserName,
    int StatusId,
    string StatusName,
    WorkItemPriority Priority,
    int? ParentWorkItemId,
    string? ParentTitle,
    int ChildCount,
    DateOnly? DueDate,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<TagResponse> Tags
);

public record CreateWorkItemRequest(
    string Title,
    string? Description,
    WorkItemType Type,
    int ProjectId,
    int? AssignedUserId,
    int StatusId,
    WorkItemPriority Priority,
    int? ParentWorkItemId,
    DateOnly? DueDate,
    IReadOnlyList<int>? TagIds
);

public record UpdateWorkItemRequest(
    string Title,
    string? Description,
    WorkItemType Type,
    int? AssignedUserId,
    int StatusId,
    WorkItemPriority Priority,
    int? ParentWorkItemId,
    DateOnly? DueDate,
    IReadOnlyList<int>? TagIds
);

public record WorkItemFilter(
    int? ProjectId,
    int? StatusId,
    WorkItemPriority? Priority,
    WorkItemType? Type,
    int? ParentWorkItemId,
    bool TopLevelOnly,
    string? Search
);
