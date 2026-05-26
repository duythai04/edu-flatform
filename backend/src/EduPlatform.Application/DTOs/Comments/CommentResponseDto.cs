namespace EduPlatform.Application.DTOs.Comments
{
    public class CommentResponseDto
    {
        public Guid Id { get; set; }

        public string Content { get; set; } = string.Empty;

        public string UserName { get; set; } = string.Empty;

        public Guid UserId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsOwner { get; set; }

        public Guid? ParentCommentId { get; set; }

        public List<CommentResponseDto> Replies { get; set; }
            = new();
    }
}