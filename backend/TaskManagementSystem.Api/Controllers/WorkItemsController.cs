using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Services;

namespace TaskManagementSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/workitems")]
public class WorkItemsController : ControllerBase
{
    private readonly IWorkItemService _service;

    public WorkItemsController(IWorkItemService service)
    {
        _service = service;
    }

    // GET /api/workitems?projectId=1&statusId=2&priority=High&type=Story&parentWorkItemId=5&topLevelOnly=true&search=login
    [HttpGet]
    public async Task<ActionResult<List<WorkItemResponse>>> GetAll(
        [FromQuery] int? projectId,
        [FromQuery] int? statusId,
        [FromQuery] WorkItemPriority? priority,
        [FromQuery] WorkItemType? type,
        [FromQuery] int? parentWorkItemId,
        [FromQuery] bool topLevelOnly = false,
        [FromQuery] string? search = null) =>
        Ok(await _service.GetFilteredAsync(new WorkItemFilter(
            projectId, statusId, priority, type, parentWorkItemId, topLevelOnly, search
        )));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<WorkItemResponse>> GetById(int id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<WorkItemResponse>> Create(CreateWorkItemRequest request)
    {
        var created = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<WorkItemResponse>> Update(int id, UpdateWorkItemRequest request) =>
        Ok(await _service.UpdateAsync(id, request));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
