namespace TaskManagementSystem.Api.DTOs;

public record TagResponse(int Id, string Name);

public record CreateTagRequest(string Name);
