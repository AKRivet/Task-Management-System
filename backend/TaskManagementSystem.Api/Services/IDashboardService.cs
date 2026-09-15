using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface IDashboardService
{
    Task<DashboardStatsResponse> GetStatsAsync();
}
