using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _users;
    private readonly ITokenService _tokenService;

    public AuthService(IRepository<User> users, ITokenService tokenService)
    {
        _users = users;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var emailTaken = await _users.Query().AnyAsync(u => u.Email == request.Email);
        if (emailTaken)
            throw AppException.Conflict($"A user with email '{request.Email}' already exists.");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Member,
        };
        await _users.AddAsync(user);
        await _users.SaveChangesAsync();

        return ToAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _users.Query().FirstOrDefaultAsync(u => u.Email == request.Email);

        // Same error whether the email doesn't exist or the password is wrong,
        // so a caller can't use this endpoint to discover which emails are registered.
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw AppException.Unauthorized("Invalid email or password.");

        return ToAuthResponse(user);
    }

    private AuthResponse ToAuthResponse(User user) =>
        new(_tokenService.CreateToken(user), new UserResponse(user.Id, user.Name, user.Email, user.Role, user.CreatedAt));
}
