using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    // 🔓 API public (không cần login)
    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok("Public endpoint");
    }

    // 🔐 Cần login (bất kỳ role nào)
    [Authorize]
    [HttpGet("auth")]
    public IActionResult Auth()
    {
        return Ok("You are authenticated");
    }

    // 👨‍🏫 Chỉ Teacher
    [Authorize(Roles = "Teacher")]
    [HttpGet("teacher")]
    public IActionResult TeacherOnly()
    {
        return Ok("You are Teacher");
    }

    // 👨‍🎓 Chỉ Student
    [Authorize(Roles = "Student")]
    [HttpGet("student")]
    public IActionResult StudentOnly()
    {
        return Ok("You are Student");
    }

    // 👑 Chỉ Admin
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public IActionResult AdminOnly()
    {
        return Ok("You are Admin");
    }
}