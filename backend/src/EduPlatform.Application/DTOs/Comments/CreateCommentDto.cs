namespace EduPlatform.Application.DTOs.Comments;

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;

    public Guid ClassroomId { get; set; }

    public Guid? ParentCommentId { get; set; }

    public Guid? AnnouncementId { get; set; }
    public Guid? AssignmentId { get; set; }
}