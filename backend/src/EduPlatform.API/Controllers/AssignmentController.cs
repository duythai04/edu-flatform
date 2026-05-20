using EduPlatform.Application.DTOs.Assignment;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentController : ControllerBase 
{
    private readonly IAssignmentService _service;
    public AssignmentController(IAssignmentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Create(CreateAssignmentDto dto) => Ok(await _service.CreateAsync(dto));

    [HttpPost("{id:guid}/files")]
    public async Task<IActionResult> UploadFile(Guid id, IFormFile file) 
    {
        var result = await _service.UploadFileAsync(id, file);
        return Ok(result);
    }

    [HttpDelete("files/{fid:guid}")]
    public async Task<IActionResult> DeleteFile(Guid fid) 
    {
        await _service.DeleteFileAsync(fid);
        return NoContent();
    }

    [HttpGet("{id:guid}/detail")]
    public async Task<IActionResult> GetAssignmentDetail(Guid id) 
    {
        // Lấy UserId và Role từ JWT Token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var userId = Guid.Parse(userIdClaim);
        
        // Gọi Service xử lý nghiệp vụ
        var result = await _service.GetDetailAsync(id, userId, role);
        return Ok(result);
    }
}