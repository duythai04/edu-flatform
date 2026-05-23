using EduPlatform.Application.DTOs.Assignment;
using Microsoft.AspNetCore.Http;

namespace EduPlatform.Application.Interfaces;

public interface IAssignmentService
{
    Task<IEnumerable<AssignmentResponseDto>> GetAllAsync();
    Task<AssignmentResponseDto> GetByIdAsync(Guid id);
    Task<AssignmentResponseDto> CreateAsync(CreateAssignmentDto dto);
    Task UpdateAsync(Guid id, UpdateAssignmentDto dto);
    Task DeleteAsync(Guid id);

    // File cũ — giữ lại để không break code khác
    Task<FileDto> UploadFileAsync(Guid assignmentId, IFormFile file);
    Task DeleteFileAsync(Guid fileId);

    // Detail
    Task<AssignmentDetailDto> GetDetailAsync(Guid assignmentId, Guid userId, string? role);

    // File mới (được dùng từ Controller đã fix)
    Task SaveAssignmentFileAsync(Guid assignmentId, string fileUrl, string fileName, long fileSize);
    Task<AssignmentFileDto?> GetAssignmentFileAsync(Guid fileId);
    Task DeleteAssignmentFileAsync(Guid fileId);

    // Comment
    Task AddCommentAsync(Guid assignmentId, Guid userId, string content);
}