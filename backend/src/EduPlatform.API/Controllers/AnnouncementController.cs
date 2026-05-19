using EduPlatform.Application.DTOs;
using EduPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementController : ControllerBase
{
    private readonly IAnnouncementService _service;
    public AnnouncementController(IAnnouncementService service) => _service = service;

    [HttpGet("class/{id:guid}")]
    public async Task<IActionResult> GetByClass(Guid id) => Ok(await _service.GetByClassRoomAsync(id));

    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Create(CreateAnnouncementDto dto)
    {
        // Lấy Id của giáo viên từ Token JWT đã đăng nhập
        var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        return Ok(await _service.CreateAsync(dto, teacherId));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Update(Guid id, UpdateAnnouncementDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}