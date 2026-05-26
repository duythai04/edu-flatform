using EduPlatform.Application.DTOs.Comments;

namespace EduPlatform.Application.Interfaces;

public interface ICommentService
{
    Task<List<CommentResponseDto>> GetByClassroomAsync(Guid classroomId, Guid currentUserId, Guid? announcementId, Guid? assignmentId);
    Task<CommentResponseDto> CreateAsync(CreateCommentDto dto, Guid currentUserId);
    Task<CommentResponseDto> UpdateAsync(Guid commentId, UpdateCommentDto dto, Guid currentUserId);
    Task DeleteAsync(Guid commentId, Guid currentUserId);
}