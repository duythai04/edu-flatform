using EduPlatform.Application.DTOs.Auth;
using EduPlatform.Application.Interfaces;
using EduPlatform.Domain.Entities;
using EduPlatform.Domain.Enums;
using EduPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password) ||
            string.IsNullOrWhiteSpace(dto.Role))
            return BadRequest("Vui lòng điền đầy đủ thông tin.");

        if (!Enum.TryParse<Role>(dto.Role, ignoreCase: true, out var role))
            return BadRequest($"Role không hợp lệ: {dto.Role}");

        var emailExists = await _context.Users
            .AnyAsync(x => x.Email == dto.Email);

        if (emailExists)
            return BadRequest("Email đã được sử dụng.");

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đăng ký thành công." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Email hoặc mật khẩu không đúng.");

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            AccessToken = token,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }
}