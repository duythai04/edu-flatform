using EduPlatform.Application.DTOs.Assignment;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting; // Bắt buộc phải có để lấy đường dẫn chuẩn

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _service;
    private readonly IWebHostEnvironment _env; // IWebHostEnvironment là chìa khóa fix lỗi trên Linux

    public AssignmentController(IAssignmentService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    // 1. API Upload file cho Assignment (Đã fix đường dẫn Tuyệt đối)
    [HttpPost("{id:guid}/files")]
    public async Task<IActionResult> UploadAssignmentFile(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("File trống.");

        // FIX: Luôn trỏ đúng vào thư mục /uploads bên trong project API của bạn
        var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        // FIX: Dùng GUID để Linux không bị lỗi mã hóa tên file (giải quyết 404 triệt để)
        var safeFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadsFolder, safeFileName);

        // Lưu file vật lý
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // LƯU Ý: Bạn cần truyền safeFileName này vào Service để lưu vào Database cột FileUrl
        // Giả sử Service của bạn nhận thêm tham số hoặc bạn tự xử lý lưu DB ở đây
        // Trong trường hợp này, tôi trả về URL GUID để Frontend truy cập được ngay
        var result = await _service.UploadFileAsync(id, file);

        return Ok(new
        {
            url = "/uploads/" + safeFileName,
            fileName = file.FileName
        });
    }

    // 2. API Detail
    [HttpGet("{id:guid}/detail")]
    public async Task<IActionResult> GetAssignmentDetail(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var userId = Guid.Parse(userIdClaim);
        var result = await _service.GetDetailAsync(id, userId, role);
        return Ok(result);
    }

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());
    [HttpPost] public async Task<IActionResult> Create(CreateAssignmentDto dto) => Ok(await _service.CreateAsync(dto));


}