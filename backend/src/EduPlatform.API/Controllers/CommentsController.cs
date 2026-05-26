using System.Security.Claims;
using EduPlatform.Application.DTOs.Comments;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/classrooms/{classroomId}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    // Lấy UserId từ JWT token
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ─── GET /api/classrooms/{classroomId}/comments ───────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetByClassroom(
    Guid classroomId,
    [FromQuery] Guid? announcementId,
    [FromQuery] Guid? assignmentId)
    {
        try
        {
            var result = await _commentService.GetByClassroomAsync(
                classroomId, CurrentUserId, announcementId, assignmentId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─── POST /api/classrooms/{classroomId}/comments ──────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create(Guid classroomId, [FromBody] CreateCommentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Gán classroomId từ route để tránh giả mạo từ body
        dto.ClassroomId = classroomId;

        try
        {
            var result = await _commentService.CreateAsync(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetByClassroom),
                new { classroomId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─── PUT /api/classrooms/{classroomId}/comments/{commentId} ─────────────
    [HttpPut("{commentId}")]
    public async Task<IActionResult> Update(
        Guid classroomId, Guid commentId, [FromBody] UpdateCommentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _commentService.UpdateAsync(commentId, dto, CurrentUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // ─── DELETE /api/classrooms/{classroomId}/comments/{commentId} ───────────
    [HttpDelete("{commentId}")]
    public async Task<IActionResult> Delete(Guid classroomId, Guid commentId)
    {
        try
        {
            await _commentService.DeleteAsync(commentId, CurrentUserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}