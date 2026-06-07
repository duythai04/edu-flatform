using EduPlatform.Application.DTOs.Assignment;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _service;
    private readonly IStorageService _storage;
    private const string Bucket = "assignments";

    public AssignmentController(IAssignmentService service, IStorageService storage)
    {
        _service = service;
        _storage = storage;
    }

    // GET api/assignment
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // POST api/assignment
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return Ok(result);
    }

    // PUT api/assignment?id={id}
    [HttpPut]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAssignmentDto dto)
    {
        if (!IsTeacher()) return Forbid();

        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
            return NotFound("Không tìm thấy bài tập.");

        await _service.UpdateAsync(id, dto);
        return Ok(await _service.GetByIdAsync(id));
    }

    // DELETE api/assignment/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!IsTeacher()) return Forbid();

        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
            return NotFound("Không tìm thấy bài tập.");

        // Xoá từng file trên Supabase Storage
        foreach (var file in existing.Files)
        {
            await _storage.DeleteAsync(Bucket, file.FileUrl);
        }

        await _service.DeleteAsync(id);
        return NoContent();
    }

    // GET api/assignment/{id}/detail
    [HttpGet("{id:guid}/detail")]
    public async Task<IActionResult> GetAssignmentDetail(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim);
        var result = await _service.GetDetailAsync(id, userId, role);

        if (result == null)
            return NotFound("Không tìm thấy bài tập.");

        return Ok(result);
    }

    // POST api/assignment/{id}/files
    [HttpPost("{id:guid}/files")]
    public async Task<IActionResult> UploadAssignmentFile(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File không được để trống.");

        const long maxSize = 10 * 1024 * 1024; // 10 MB
        if (file.Length > maxSize)
            return BadRequest("File vượt quá giới hạn 10 MB.");

        // Nhóm file theo assignmentId để dễ quản lý trên Supabase
        var extension = Path.GetExtension(file.FileName);
        var originalName = Path.GetFileNameWithoutExtension(file.FileName);
        var safeFileName = $"{id}/{originalName}_{Guid.NewGuid().ToString()[..8]}{extension}";

        await using var stream = file.OpenReadStream();
        var publicUrl = await _storage.UploadAsync(Bucket, safeFileName, stream, file.ContentType);

        await _service.SaveAssignmentFileAsync(id, publicUrl, file.FileName, file.Length);

        return Ok(new
        {
            url = publicUrl,
            fileName = file.FileName,
            fileSize = file.Length
        });
    }

    // DELETE api/assignment/{id}/files/{fileId}
    [HttpDelete("{id:guid}/files/{fileId:guid}")]
    public async Task<IActionResult> DeleteAssignmentFile(Guid id, Guid fileId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        if (!IsTeacher()) return Forbid();

        var fileRecord = await _service.GetAssignmentFileAsync(fileId);
        if (fileRecord == null)
            return NotFound("Không tìm thấy file.");

        await _storage.DeleteAsync(Bucket, fileRecord.FileUrl);
        await _service.DeleteAssignmentFileAsync(fileId);

        return NoContent();
    }

    // GET api/assignment/class/{classId}/upcoming
    [HttpGet("class/{classId:guid}/upcoming")]
    public async Task<IActionResult> GetUpcomingByClass(Guid classId)
    {
        var result = await _service.GetUpcomingByClassAsync(classId);
        return Ok(result);
    }

    private bool IsTeacher()
        => User.FindFirst(ClaimTypes.Role)?.Value?.ToLower() == "teacher";
}