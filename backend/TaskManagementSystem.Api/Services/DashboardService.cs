using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class DashboardService : IDashboardService
{
    private const string DoneStatusName = "Done";

    private readonly IRepository<WorkItem> _workItems;
    private readonly IProjectAccessService _access;

    public DashboardService(IRepository<WorkItem> workItems, IProjectAccessService access)
    {
        _workItems = workItems;
        _access = access;
    }

    public async Task<DashboardStatsResponse> GetStatsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekFromNow = today.AddDays(7);

        // Scoped to the caller's own accessible projects, so a Member's
        // dashboard doesn't leak counts from projects they can't otherwise see.
        var accessibleIds = await _access.GetAccessibleProjectIdsAsync();
        var scoped = _workItems.Query();
        if (accessibleIds is not null)
            scoped = scoped.Where(w => accessibleIds.Contains(w.ProjectId));

        var total = await scoped.CountAsync();

        var overdue = await scoped
            .CountAsync(w => w.DueDate != null && w.DueDate < today && w.Status.Name != DoneStatusName);

        var dueThisWeek = await scoped
            .CountAsync(w => w.DueDate != null && w.DueDate >= today && w.DueDate <= weekFromNow);

        var byStatus = await scoped
            .GroupBy(w => w.Status.Name)
            .Select(g => new StatusCount(g.Key, g.Count()))
            .ToListAsync();

        var byPriority = await scoped
            .GroupBy(w => w.Priority)
            .Select(g => new PriorityCount(g.Key, g.Count()))
            .ToListAsync();

        var byType = await scoped
            .GroupBy(w => w.Type)
            .Select(g => new TypeCount(g.Key, g.Count()))
            .ToListAsync();

        return new DashboardStatsResponse(total, overdue, dueThisWeek, byStatus, byPriority, byType);
    }
}
