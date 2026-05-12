using EduPlatform.Domain.Entities;

namespace EduPlatform.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}