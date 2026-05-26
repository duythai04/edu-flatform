using System.ComponentModel.DataAnnotations;

namespace EduPlatform.Application.DTOs.Comments;

public class UpdateCommentDto
{
    [Required(ErrorMessage = "Nội dung không được để trống")]
    [MaxLength(2000, ErrorMessage = "Nội dung tối đa 2000 ký tự")]
    public string Content { get; set; } = string.Empty;
}