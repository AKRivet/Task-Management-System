using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.DTOs;

public record StatusCount(string StatusName, int Count);

public record PriorityCount(WorkItemPriority Priority, int Count);

public record TypeCount(WorkItemType Type, int Count);

public record DashboardStatsResponse(
    int TotalWorkItems,
    int OverdueCount,
    int DueThisWeekCount,
    IReadOnlyList<StatusCount> ByStatus,
    IReadOnlyList<PriorityCount> ByPriority,
    IReadOnlyList<TypeCount> ByType
);
