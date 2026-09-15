using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
