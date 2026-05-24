// Application/Services/SubmissionService.cs
using EduPlatform.Application.DTOs.Submission;
using EduPlatform.Application.Interfaces;
using EduPlatform.Domain.Entities;
using EduPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Services;

public class SubmissionService : ISubmissionService
{
    private readonly AppDbContext _db;

    public SubmissionService(AppDbContext db) => _db = db;

    // Nộp bài (nộp lại thì xoá bài cũ) 
    public async Task<SubmissionDto> CreateAsync(Guid assignmentId, Guid studentId,
                                                  string? fileUrl, string? fileName,
                                                  string? content)
    {
        // Nếu đã nộp trước đó -> xoá để nộp lại
        var existing = await _db.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId
                                   && s.StudentId == studentId);
        if (existing != null)
            _db.Submissions.Remove(existing);

        var submission = new Submission
        {
            AssignmentId = assignmentId,
            StudentId = studentId,
            FileUrl = fileUrl,
            FileName = fileName,
            Content = content ?? string.Empty,
            SubmittedAt = DateTime.Now,
        };

        _db.Submissions.Add(submission);
        await _db.SaveChangesAsync();

        // Load navigation để map
        await _db.Entry(submission).Reference(x => x.Student).LoadAsync();
        return MapToDto(submission);
    }

    // Lấy 1 bài nộp 
    public async Task<SubmissionDto?> GetByIdAsync(Guid id)
    {
        var s = await _db.Submissions
            .Include(x => x.Student)
            .FirstOrDefaultAsync(x => x.Id == id);

        return s == null ? null : MapToDto(s);
    }

    //  Danh sách bài nộp theo assignment
    public async Task<IEnumerable<SubmissionDto>> GetByAssignmentAsync(Guid assignmentId)
    {
        var list = await _db.Submissions
            .Include(x => x.Student)
            .Where(x => x.AssignmentId == assignmentId)
            .OrderByDescending(x => x.SubmittedAt)
            .ToListAsync();

        return list.Select(MapToDto);
    }

    //  Hủy nộp bài
    public async Task DeleteAsync(Guid id)
    {
        var s = await _db.Submissions.FindAsync(id);
        if (s == null) return;

        _db.Submissions.Remove(s);
        await _db.SaveChangesAsync();
    }

    // Chấm điểm 
    public async Task<SubmissionDto?> GradeAsync(Guid id, GradeSubmissionDto dto)
    {
        var s = await _db.Submissions
            .Include(x => x.Student)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return null;

        s.Score = dto.Score;
        await _db.SaveChangesAsync();

        return MapToDto(s);
    }

    // Helper map
    private static SubmissionDto MapToDto(Submission s) => new()
    {
        Id = s.Id,
        AssignmentId = s.AssignmentId,
        StudentId = s.StudentId,
        StudentName = s.Student?.FullName ?? "Unknown",
        FileUrl = s.FileUrl,
        FileName = s.FileName,
        Content = s.Content,
        SubmittedAt = s.SubmittedAt,
        Score = s.Score,
    };
}