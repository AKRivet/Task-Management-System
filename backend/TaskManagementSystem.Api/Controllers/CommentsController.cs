using Microsoft.AspNetCore.Mvc;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Services;

namespace TaskManagementSystem.Api.Controllers;

[ApiController]
[Route("api/tasks/{taskId:int}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _service;

    public CommentsController(ICommentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<CommentResponse>>> GetByTask(int taskId) =>
        Ok(await _service.GetByTaskIdAsync(taskId));

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> Create(int taskId, CreateCommentRequest request)
    {
        var created = await _service.CreateAsync(taskId, request);
        return CreatedAtAction(nameof(GetByTask), new { taskId }, created);
    }
}
