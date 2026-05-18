using EduPlatform.Domain.Common;

namespace EduPlatform.Domain.Entities;
public class ClassroomMember : BaseEntity
{

    public Guid UserId { get; set; }

    public Guid ClassroomId { get; set; }

    public User User { get; set; }

    public Classroom Classroom { get; set; }

    public string? Role {get; set;}
}