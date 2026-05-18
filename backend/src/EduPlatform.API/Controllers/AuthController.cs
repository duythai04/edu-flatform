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

    public AuthController(
        AppDbContext context,
        IJwtService jwtService
    )
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var emailExists = await _context.Users
            .AnyAsync(x => x.Email == dto.Email);

        if (emailExists)
        {
            return BadRequest("Email already exists");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = Enum.Parse<Role>(dto.Role)
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Register success"
        });
    }



    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized("Invalid credentials");
        }

        var validPassword = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );

        if (!validPassword)
        {
            return Unauthorized("Invalid credentials");
        }

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