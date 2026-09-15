using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.DTOs;

public record UserResponse(int Id, string Name, string Email, UserRole Role, DateTimeOffset CreatedAt);

public record UpdateUserRequest(string Name, string Email);
