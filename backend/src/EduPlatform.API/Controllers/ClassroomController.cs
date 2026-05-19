using System.Security.Claims;
using EduPlatform.Infrastructure.Persistence;
using EduPlatform.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduPlatform.Application.DTOs.Classroom;
using Microsoft.EntityFrameworkCore;
using EduPlatform.Application.Interfaces;

namespace EduPlatform.API.Controllers;



[ApiController]
[Route("api/classroom")]
public class ClassroomController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IClassroomService _classroomService;



    public ClassroomController(AppDbContext context, IClassroomService classroomService)
    {
        _context = context;
        _classroomService = classroomService;
    }


    // teacher tạo class 
    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClassroomDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var classroom = new Classroom
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            TeacherId = Guid.Parse(userId),
            ClassCode = GenerateJoinCode()
        };

        _context.Classrooms.Add(classroom);

        var member = new ClassroomMember
        {
            UserId = Guid.Parse(userId),
            ClassroomId = classroom.Id,
            Role = "Teacher"
        };

        _context.ClassroomMembers.Add(member);

        await _context.SaveChangesAsync();

        return Ok(classroom);
    }



    // student join class 
    [Authorize(Roles = "Student")]
    [HttpPost("join")]
    public async Task<IActionResult> Join([FromBody] JoinClassroomDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var classroom = await _context.Classrooms
            .FirstOrDefaultAsync(x => x.ClassCode == request.Code);

        if (classroom == null)
            return NotFound("Classroom not found");

        var userGuid = Guid.Parse(userId);

        //  check đã join chưa
        var existed = await _context.ClassroomMembers
            .AnyAsync(x =>
                x.UserId == userGuid &&
                x.ClassroomId == classroom.Id);

        if (existed)
            return BadRequest("Already joined");

        var member = new ClassroomMember
        {
            UserId = userGuid,
            ClassroomId = classroom.Id,
            Role = "Student"
        };

        _context.ClassroomMembers.Add(member);
        await _context.SaveChangesAsync();

        return Ok("Joined successfully");
    }



    // get class user
    [Authorize]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyClassrooms()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var userGuid = Guid.Parse(userId);

        var joinedClasses = await _context.ClassroomMembers
            .Where(x => x.UserId == userGuid)
            .Select(x => new
            {
                x.Classroom.Id,
                x.Classroom.Name,
                x.Classroom.Description,
                x.Classroom.ClassCode,
                Role = "Member"
            })
            .ToListAsync();

        // lớp user tạo (teacher)
        var ownedClasses = await _context.Classrooms
            .Where(x => x.TeacherId == userGuid)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Description,
                x.ClassCode,
                Role = "Teacher"
            })
            .ToListAsync();


        var result = ownedClasses
            .Concat(joinedClasses)
            .GroupBy(x => x.Id)
            .Select(g => g.First())
            .ToList();

        return Ok(result);
    }

    // helper
    private string GenerateJoinCode()
    {
        return Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();
    }


    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDetails(Guid id) // 1. Đổi int id thành Guid id
    {
        // 2. Lấy UserId từ Token (nó là chuỗi string)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized();

        // 3. Chuyển đổi chuỗi string đó sang Guid
        if (!Guid.TryParse(userIdClaim, out var userGuid))
            return Unauthorized();

        // 4. Bây giờ truyền id (Guid) và userGuid (Guid) vào service sẽ hết lỗi đỏ
        var classroom = await _classroomService.GetClassroomDetailAsync(id, userGuid);

        if (classroom == null)
        {
            return NotFound(new { message = "Lớp học không tồn tại hoặc bạn không có quyền truy cập." });
        }

        return Ok(classroom);
    }
}