using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Services;

namespace TaskManagementSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/workitems/{workItemId:int}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _service;

    public CommentsController(ICommentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<CommentResponse>>> GetByWorkItem(int workItemId) =>
        Ok(await _service.GetByWorkItemIdAsync(workItemId));

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> Create(int workItemId, CreateCommentRequest request)
    {
        var created = await _service.CreateAsync(workItemId, request);
        return CreatedAtAction(nameof(GetByWorkItem), new { workItemId }, created);
    }
}
