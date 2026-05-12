namespace EduPlatform.Application.DTOs.Auth;

public class AuthResponseDto
{
    public string AccessToken { get; set; }

    public string FullName { get; set; }

    public string Email { get; set; }

    public string Role { get; set; }
}