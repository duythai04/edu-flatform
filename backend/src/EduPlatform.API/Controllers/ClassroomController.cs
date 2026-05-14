using System.Security.Claims;
using EduPlatform.Infrastructure.Persistence;
using EduPlatform.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduPlatform.Application.DTOs.Classroom;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/classroom")]
public class ClassroomController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClassroomController(AppDbContext context)
    {
        _context = context;
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
            ClassroomId = classroom.Id
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
            ClassroomId = classroom.Id
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

        var classes = await _context.ClassroomMembers
            .Where(x => x.UserId == Guid.Parse(userId))
            .Select(x => new
            {
                x.Classroom.Id,
                x.Classroom.Name,
                x.Classroom.ClassCode
            })
            .ToListAsync();

        return Ok(classes);
    }

  

    // helper
    private string GenerateJoinCode()
    {
        return Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();
    }

    
}