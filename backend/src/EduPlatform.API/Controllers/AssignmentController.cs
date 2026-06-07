using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using EduPlatform.Application.DTOs.Assignment;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Supabase;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _service;
    private readonly Cloudinary _cloudinary;
    private readonly IConfiguration _config;

    public AssignmentController(IAssignmentService service, Cloudinary cloudinary, IConfiguration config)
    {
        _service = service;
        _cloudinary = cloudinary;
        _config = config;
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

    // PUT api/assignment/{id}
    [HttpPut("{id:guid}")]
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

        const long maxSize = 10 * 1024 * 1024;
        if (file.Length > maxSize)
            return BadRequest("File vượt quá giới hạn 10 MB.");

        try
        {
            var supabaseUrl = _config["SUPABASE_URL"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL");
            var supabaseKey = _config["SUPABASE_KEY"] ?? Environment.GetEnvironmentVariable("SUPABASE_KEY");

            var supabase = new Supabase.Client(supabaseUrl, supabaseKey);
            await supabase.InitializeAsync();

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var bytes = ms.ToArray();

            await supabase.Storage
                .From("assignments")
                .Upload(bytes, fileName, new Supabase.Storage.FileOptions
                {
                    ContentType = file.ContentType,
                    Upsert = true
                });

            var fileUrl = supabase.Storage
                .From("assignments")
                .GetPublicUrl(fileName);

            await _service.SaveAssignmentFileAsync(id, fileUrl, file.FileName, file.Length);
            return Ok(new { url = fileUrl, fileName = file.FileName, fileSize = file.Length });
        }
        catch (Exception ex)
        {
            return BadRequest("Upload thất bại: " + ex.Message);
        }
    }

    // DELETE api/assignment/{id}/files/{fileId}
    [HttpDelete("{id:guid}/files/{fileId:guid}")]
    public async Task<IActionResult> DeleteAssignmentFile(Guid id, Guid fileId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        if (role?.ToLower() != "teacher")
            return Forbid();

        var fileRecord = await _service.GetAssignmentFileAsync(fileId);
        if (fileRecord == null)
            return NotFound("Không tìm thấy file.");

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