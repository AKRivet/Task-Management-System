using Microsoft.AspNetCore.Mvc;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Services;

namespace TaskManagementSystem.Api.Controllers;

[ApiController]
[Route("api/statuses")]
public class StatusesController : ControllerBase
{
    private readonly IStatusService _service;

    public StatusesController(IStatusService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<StatusResponse>>> GetAll() => Ok(await _service.GetAllAsync());
}
