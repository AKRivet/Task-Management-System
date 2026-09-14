namespace TaskManagementSystem.Api.DTOs;

public record ProjectResponse(
    int Id,
    string Name,
    string? Description,
    int OwnerUserId,
    string OwnerName,
    DateTimeOffset CreatedAt,
    int TaskCount
);

public record CreateProjectRequest(string Name, string? Description, int OwnerUserId);

public record UpdateProjectRequest(string Name, string? Description);
