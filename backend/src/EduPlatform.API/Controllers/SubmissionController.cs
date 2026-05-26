using EduPlatform.Application.DTOs.Submission;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubmissionController : ControllerBase
{
    private readonly ISubmissionService _service;
    private readonly IWebHostEnvironment _env;

    public SubmissionController(ISubmissionService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    // POST /api/submission  — học sinh nộp bài
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Submit([FromForm] SubmitRequestDto request)
    {
        var studentId = GetUserId();
        if (studentId == null) return Unauthorized();

        string? fileUrl = null;
        string? fileName = null;

        // Xử lý file nếu có đính kèm
        if (request.File != null && request.File.Length > 0)
        {
            const long maxSize = 20 * 1024 * 1024;
            if (request.File.Length > maxSize)
                return BadRequest("File vượt quá giới hạn 20 MB.");

            var folder = Path.Combine(_env.ContentRootPath, "uploads", "submissions");
            Directory.CreateDirectory(folder);

            var ext = Path.GetExtension(request.File.FileName);
            var safeName = Guid.NewGuid() + ext;
            var path = Path.Combine(folder, safeName);

            await using (var stream = new FileStream(path, FileMode.Create))
                await request.File.CopyToAsync(stream);

            fileUrl = "/uploads/submissions/" + safeName;
            fileName = request.File.FileName;
        }

        // Phải có ít nhất file hoặc nội dung text
        if (fileUrl == null && string.IsNullOrWhiteSpace(request.Content))
            return BadRequest("Vui lòng nộp file hoặc nhập nội dung bài làm.");

        var result = await _service.CreateAsync(
            request.AssignmentId, studentId.Value, fileUrl, fileName, request.Content);

        return Ok(result);
    }

    // GET /api/submission/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var s = await _service.GetByIdAsync(id);
        return s == null ? NotFound() : Ok(s);
    }

    // GET /api/submission/assignment/{assignmentId}  — giáo viên xem danh sách
    [HttpGet("assignment/{assignmentId:guid}")]
    public async Task<IActionResult> GetByAssignment(Guid assignmentId)
    {
        if (!IsTeacher()) return Forbid();
        return Ok(await _service.GetByAssignmentAsync(assignmentId));
    }

    // DELETE /api/submission/{id}  — hủy nộp bài
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var submission = await _service.GetByIdAsync(id);
        if (submission == null) return NotFound();

        if (!IsTeacher() && submission.StudentId != GetUserId())
            return Forbid();

        // Xoá file vật lý nếu có
        if (!string.IsNullOrEmpty(submission.FileUrl))
        {
            var relative = submission.FileUrl.TrimStart('/')
                                             .Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(_env.ContentRootPath, relative);
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);
        }

        await _service.DeleteAsync(id);
        return NoContent();
    }

    // POST /api/submission/{id}/grade  — giáo viên chấm điểm
    [HttpPost("{id:guid}/grade")]
    public async Task<IActionResult> Grade(Guid id, [FromBody] GradeSubmissionDto dto)
    {
        if (!IsTeacher()) return Forbid();
        var result = await _service.GradeAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private bool IsTeacher()
        => User.FindFirst(ClaimTypes.Role)?.Value?.ToLower() == "teacher";
}