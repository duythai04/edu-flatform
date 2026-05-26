using System.ComponentModel.DataAnnotations;
using EduPlatform.Domain.Common;

namespace EduPlatform.Domain.Entities;


public class Comment : BaseEntity
{
    [Required]
    public string Content { get; set; } = string.Empty;

    // user comment
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? AnnouncementId { get; set; }
    public Guid? AssignmentId { get; set; }

    // classroom
    public Guid ClassroomId { get; set; }
    public Classroom Classroom { get; set; } = null!;


    // Reply comment
    public Guid? ParentCommentId { get; set; }

    public virtual Comment ParentComment { get; set; }

    public virtual ICollection<Comment> Replies { get; set; }

    = new List<Comment>();
}

