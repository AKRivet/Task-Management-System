namespace TaskManagementSystem.Api.DTOs;

public record ProjectMemberSummary(int Id, string Name);

public record ProjectResponse(
    int Id,
    string Name,
    string? Description,
    IReadOnlyList<ProjectMemberSummary> Members,
    DateTimeOffset CreatedAt,
    int WorkItemCount
);

public record CreateProjectRequest(string Name, string? Description, IReadOnlyList<int> MemberUserIds);

public record UpdateProjectRequest(string Name, string? Description, IReadOnlyList<int> MemberUserIds);
