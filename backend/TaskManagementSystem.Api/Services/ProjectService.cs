using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class ProjectService : IProjectService
{
    private readonly IRepository<Project> _projects;
    private readonly IRepository<User> _users;

    public ProjectService(IRepository<Project> projects, IRepository<User> users)
    {
        _projects = projects;
        _users = users;
    }

    public async Task<List<ProjectResponse>> GetAllAsync()
    {
        var projects = await WithDetails().OrderByDescending(p => p.CreatedAt).ToListAsync();
        return projects.Select(ToResponse).ToList();
    }

    public async Task<ProjectResponse> GetByIdAsync(int id)
    {
        var project = await WithDetails().FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound($"Project {id} not found.");
        return ToResponse(project);
    }

    public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request)
    {
        var owner = await _users.GetByIdAsync(request.OwnerUserId)
            ?? throw AppException.NotFound($"User {request.OwnerUserId} not found.");

        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            OwnerUserId = request.OwnerUserId,
        };
        await _projects.AddAsync(project);
        await _projects.SaveChangesAsync();

        project.Owner = owner;
        return ToResponse(project);
    }

    public async Task<ProjectResponse> UpdateAsync(int id, UpdateProjectRequest request)
    {
        var project = await WithDetails().FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound($"Project {id} not found.");

        project.Name = request.Name;
        project.Description = request.Description;
        await _projects.SaveChangesAsync();
        return ToResponse(project);
    }

    public async Task DeleteAsync(int id)
    {
        var project = await _projects.GetByIdAsync(id) ?? throw AppException.NotFound($"Project {id} not found.");
        _projects.Remove(project);
        await _projects.SaveChangesAsync();
    }

    private IQueryable<Project> WithDetails() => _projects.Query().Include(p => p.Owner).Include(p => p.Tasks);

    private static ProjectResponse ToResponse(Project p) => new(
        p.Id, p.Name, p.Description, p.OwnerUserId, p.Owner?.Name ?? string.Empty, p.CreatedAt, p.Tasks?.Count ?? 0
    );
}
