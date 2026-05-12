using EduPlatform.Domain.Common;
using EduPlatform.Domain.Enums;

namespace EduPlatform.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; }

    public string Email { get; set; }

    public string PasswordHash { get; set; }

    public Role Role { get; set; }
}