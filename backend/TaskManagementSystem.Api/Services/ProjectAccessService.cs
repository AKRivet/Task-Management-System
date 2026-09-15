using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class ProjectAccessService : IProjectAccessService
{
    private readonly ICurrentUserService _currentUser;
    private readonly IRepository<ProjectMember> _members;
    private readonly IRepository<WorkItem> _workItems;

    public ProjectAccessService(ICurrentUserService currentUser, IRepository<ProjectMember> members, IRepository<WorkItem> workItems)
    {
        _currentUser = currentUser;
        _members = members;
        _workItems = workItems;
    }

    public async Task<bool> HasAccessAsync(int projectId)
    {
        if (_currentUser.IsAdmin) return true;

        var userId = _currentUser.UserId;
        var isMember = await _members.Query().AnyAsync(m => m.ProjectId == projectId && m.UserId == userId);
        if (isMember) return true;

        return await _workItems.Query().AnyAsync(w => w.ProjectId == projectId && w.AssignedUserId == userId);
    }

    public async Task EnsureAccessAsync(int projectId)
    {
        if (!await HasAccessAsync(projectId))
            throw AppException.Forbidden("You don't have access to this project.");
    }

    public async Task<List<int>?> GetAccessibleProjectIdsAsync()
    {
        if (_currentUser.IsAdmin) return null;

        var userId = _currentUser.UserId;
        var memberProjectIds = await _members.Query().Where(m => m.UserId == userId).Select(m => m.ProjectId).ToListAsync();
        var assignedProjectIds = await _workItems.Query()
            .Where(w => w.AssignedUserId == userId)
            .Select(w => w.ProjectId)
            .Distinct()
            .ToListAsync();

        return memberProjectIds.Union(assignedProjectIds).ToList();
    }
}
