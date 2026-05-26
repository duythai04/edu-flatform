using EduPlatform.Domain.Common;

namespace EduPlatform.Domain.Entities;

public class Classroom : BaseEntity
{
    public string Name { get; set; }

    public string Description { get; set; }

    public string ClassCode { get; set; }

    public Guid TeacherId { get; set; }


    public virtual User Teacher { get; set; }
    public virtual ICollection<ClassroomMember> ClassroomMembers { get; set; } = new List<ClassroomMember>();
    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();


}