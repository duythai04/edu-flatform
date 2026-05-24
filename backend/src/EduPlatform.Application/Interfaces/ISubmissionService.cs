using EduPlatform.Application.DTOs.Submission;

namespace EduPlatform.Application.Interfaces;

public interface ISubmissionService
{
    Task<SubmissionDto> CreateAsync(Guid assignmentId, Guid studentId,
                                    string? fileUrl, string? fileName, string? content);
    Task<SubmissionDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<SubmissionDto>> GetByAssignmentAsync(Guid assignmentId);
    Task DeleteAsync(Guid id);
    Task<SubmissionDto?> GradeAsync(Guid id, GradeSubmissionDto dto);
}