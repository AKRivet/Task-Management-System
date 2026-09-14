using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _users;

    public UserService(IRepository<User> users)
    {
        _users = users;
    }

    public async Task<List<UserResponse>> GetAllAsync()
    {
        var users = await _users.Query().OrderBy(u => u.Name).ToListAsync();
        return users.Select(ToResponse).ToList();
    }

    public async Task<UserResponse> GetByIdAsync(int id)
    {
        var user = await _users.GetByIdAsync(id) ?? throw AppException.NotFound($"User {id} not found.");
        return ToResponse(user);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        await EnsureEmailAvailable(request.Email, excludeUserId: null);

        var user = new User { Name = request.Name, Email = request.Email };
        await _users.AddAsync(user);
        await _users.SaveChangesAsync();
        return ToResponse(user);
    }

    public async Task<UserResponse> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _users.GetByIdAsync(id) ?? throw AppException.NotFound($"User {id} not found.");
        await EnsureEmailAvailable(request.Email, excludeUserId: id);

        user.Name = request.Name;
        user.Email = request.Email;
        await _users.SaveChangesAsync();
        return ToResponse(user);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _users.GetByIdAsync(id) ?? throw AppException.NotFound($"User {id} not found.");
        _users.Remove(user);
        await _users.SaveChangesAsync();
    }

    private async Task EnsureEmailAvailable(string email, int? excludeUserId)
    {
        var taken = await _users.Query().AnyAsync(u => u.Email == email && u.Id != excludeUserId);
        if (taken)
            throw AppException.Conflict($"A user with email '{email}' already exists.");
    }

    private static UserResponse ToResponse(User u) => new(u.Id, u.Name, u.Email, u.CreatedAt);
}
