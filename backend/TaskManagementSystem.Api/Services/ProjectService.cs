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
    private readonly IProjectAccessService _access;

    public ProjectService(IRepository<Project> projects, IRepository<User> users, IProjectAccessService access)
    {
        _projects = projects;
        _users = users;
        _access = access;
    }

    public async Task<PagedResult<ProjectResponse>> GetPagedAsync(ProjectQuery query)
    {
        var projects = WithDetails();

        var accessibleIds = await _access.GetAccessibleProjectIdsAsync();
        if (accessibleIds is not null)
            projects = projects.Where(p => accessibleIds.Contains(p.Id));

        if (!string.IsNullOrWhiteSpace(query.Search))
            projects = projects.Where(p => EF.Functions.ILike(p.Name, $"%{query.Search}%"));

        var descending = string.Equals(query.SortDir, "desc", StringComparison.OrdinalIgnoreCase);
        projects = query.SortBy?.ToLowerInvariant() switch
        {
            "createdat" => descending ? projects.OrderByDescending(p => p.CreatedAt) : projects.OrderBy(p => p.CreatedAt),
            "workitemcount" => descending ? projects.OrderByDescending(p => p.WorkItems.Count) : projects.OrderBy(p => p.WorkItems.Count),
            _ => descending ? projects.OrderByDescending(p => p.Name) : projects.OrderBy(p => p.Name),
        };

        var totalCount = await projects.CountAsync();
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var pageItems = await projects.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<ProjectResponse>(pageItems.Select(ToResponse).ToList(), totalCount, page, pageSize);
    }

    public async Task<ProjectResponse> GetByIdAsync(int id)
    {
        await _access.EnsureAccessAsync(id);

        var project = await WithDetails().FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound($"Project {id} not found.");
        return ToResponse(project);
    }

    public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request)
    {
        var memberIds = (request.MemberUserIds ?? []).Distinct().ToList();
        if (memberIds.Count == 0)
            throw AppException.BadRequest("A project needs at least one member.");
        await EnsureUsersExist(memberIds);

        var project = new Project { Name = request.Name, Description = request.Description };
        foreach (var userId in memberIds)
            project.Members.Add(new ProjectMember { UserId = userId });

        await _projects.AddAsync(project);
        await _projects.SaveChangesAsync();

        var created = await WithDetails().FirstAsync(p => p.Id == project.Id);
        return ToResponse(created);
    }

    public async Task<ProjectResponse> UpdateAsync(int id, UpdateProjectRequest request)
    {
        await _access.EnsureAccessAsync(id);

        var project = await WithDetails().FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound($"Project {id} not found.");

        var memberIds = (request.MemberUserIds ?? []).Distinct().ToList();
        if (memberIds.Count == 0)
            throw AppException.BadRequest("A project needs at least one member.");
        await EnsureUsersExist(memberIds);

        project.Name = request.Name;
        project.Description = request.Description;

        var toRemove = project.Members.Where(m => !memberIds.Contains(m.UserId)).ToList();
        foreach (var m in toRemove)
            project.Members.Remove(m);

        var existingIds = project.Members.Select(m => m.UserId).ToHashSet();
        foreach (var userId in memberIds.Where(uid => !existingIds.Contains(uid)))
            project.Members.Add(new ProjectMember { ProjectId = id, UserId = userId });

        await _projects.SaveChangesAsync();

        var updated = await WithDetails().FirstAsync(p => p.Id == id);
        return ToResponse(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var project = await _projects.GetByIdAsync(id) ?? throw AppException.NotFound($"Project {id} not found.");
        _projects.Remove(project);
        await _projects.SaveChangesAsync();
    }

    private async Task EnsureUsersExist(IReadOnlyList<int> userIds)
    {
        var foundCount = await _users.Query().CountAsync(u => userIds.Contains(u.Id));
        if (foundCount != userIds.Count)
            throw AppException.BadRequest("One or more member user IDs do not exist.");
    }

    private IQueryable<Project> WithDetails() =>
        _projects.Query().Include(p => p.Members).ThenInclude(m => m.User).Include(p => p.WorkItems);

    private static ProjectResponse ToResponse(Project p) => new(
        p.Id,
        p.Name,
        p.Description,
        p.Members.Select(m => new ProjectMemberSummary(m.User.Id, m.User.Name)).OrderBy(m => m.Name).ToList(),
        p.CreatedAt,
        p.WorkItems?.Count ?? 0
    );
}
