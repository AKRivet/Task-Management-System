namespace TaskManagementSystem.Api.Services;

public interface ICurrentUserService
{
    int UserId { get; }
    bool IsAdmin { get; }
}
