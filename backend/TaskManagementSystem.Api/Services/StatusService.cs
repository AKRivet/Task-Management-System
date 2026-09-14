using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class StatusService : IStatusService
{
    private readonly IRepository<Status> _statuses;

    public StatusService(IRepository<Status> statuses)
    {
        _statuses = statuses;
    }

    public async Task<List<StatusResponse>> GetAllAsync()
    {
        var statuses = await _statuses.Query().OrderBy(s => s.Id).ToListAsync();
        return statuses.Select(s => new StatusResponse(s.Id, s.Name)).ToList();
    }
}
