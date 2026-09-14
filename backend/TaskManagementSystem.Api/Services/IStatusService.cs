using TaskManagementSystem.Api.DTOs;

namespace TaskManagementSystem.Api.Services;

public interface IStatusService
{
    Task<List<StatusResponse>> GetAllAsync();
}
