using EduPlatform.Application.DTOs.Assignment;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _service;
    private readonly IWebHostEnvironment _env;

    public AssignmentController(IAssignmentService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
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


    // PUT api/assignment
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


    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!IsTeacher()) return Forbid();

        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
            return NotFound("Không tìm thấy bài tập.");

        // Xoá file vật lý của từng file đính kèm
        foreach (var file in existing.Files)
        {
            var relativePath = file.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(_env.ContentRootPath, relativePath);
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);
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

        // Giới hạn kích thước file (10 MB)
        const long maxSize = 10 * 1024 * 1024;
        if (file.Length > maxSize)
            return BadRequest("File vượt quá giới hạn 10 MB.");

        // Tạo thư mục uploads nếu chưa có
        var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Dùng GUID làm tên file để tránh lỗi ký tự đặc biệt trên Linux
        var extension = Path.GetExtension(file.FileName);
        var safeFileName = Guid.NewGuid().ToString() + extension;
        var filePath = Path.Combine(uploadsFolder, safeFileName);

        // Lưu file vật lý
        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // FIX: Truyền safeFileName vào service để DB lưu đúng URL
        var fileUrl = "/uploads/" + safeFileName;
        await _service.SaveAssignmentFileAsync(id, fileUrl, file.FileName, file.Length);

        return Ok(new
        {
            url = fileUrl,
            fileName = file.FileName,
            fileSize = file.Length
        });
    }


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


        var relativePath = fileRecord.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(_env.ContentRootPath, relativePath);
        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        await _service.DeleteAssignmentFileAsync(fileId);

        return NoContent();
    }

    private bool IsTeacher()
        => User.FindFirst(ClaimTypes.Role)?.Value?.ToLower() == "teacher";



    [HttpGet("class/{classId:guid}/upcoming")]
    public async Task<IActionResult> GetUpcomingByClass(Guid classId)
    {
        var result = await _service.GetUpcomingByClassAsync(classId);
        return Ok(result);
    }


}