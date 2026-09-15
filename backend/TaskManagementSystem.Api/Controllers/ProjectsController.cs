using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Services;

namespace TaskManagementSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _service;

    public ProjectsController(IProjectService service)
    {
        _service = service;
    }

    // GET /api/projects?search=web&sortBy=name&sortDir=asc&page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProjectResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortDir,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10) =>
        Ok(await _service.GetPagedAsync(new ProjectQuery(search, sortBy, sortDir, page, pageSize)));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectResponse>> GetById(int id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectResponse>> Create(CreateProjectRequest request)
    {
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProjectResponse>> Update(int id, UpdateProjectRequest request) =>
        Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
