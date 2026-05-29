using EduPlatform.Application.DTOs.Assignment;
using EduPlatform.Application.Interfaces;
using EduPlatform.Domain.Entities;
using EduPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _context;

    public AssignmentService(AppDbContext context)
    {
        _context = context;
    }

    // get all
    public async Task<IEnumerable<AssignmentResponseDto>> GetAllAsync()
    {
        return await _context.Assignments
            .Include(a => a.AssignmentFiles)
            .Select(a => new AssignmentResponseDto(
                a.Id, a.Title, a.Description, a.DueDate, a.MaxScore, a.ClassroomId, a.CreatedAt,
                a.AssignmentFiles.Select(f => new FileDto(f.Id, f.FileName, f.FileUrl, f.FileSize)).ToList()
            )).ToListAsync();
    }

    // GET BY ID
    public async Task<AssignmentResponseDto> GetByIdAsync(Guid id)
    {
        var a = await _context.Assignments
            .Include(x => x.AssignmentFiles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null) return null!;

        return new AssignmentResponseDto(
            a.Id, a.Title, a.Description, a.DueDate, a.MaxScore, a.ClassroomId, a.CreatedAt,
            a.AssignmentFiles.Select(f => new FileDto(f.Id, f.FileName, f.FileUrl, f.FileSize)).ToList()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // GET DETAIL (Student + Teacher view)
    // ─────────────────────────────────────────────────────────────
    public async Task<AssignmentDetailDto> GetDetailAsync(Guid assignmentId, Guid userId, string? role)
    {
        var assignment = await _context.Assignments
            .Include(a => a.AssignmentFiles)
            .Include(a => a.Classroom)
                .ThenInclude(c => c.Teacher)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            throw new Exception("Assignment not found");

        var dto = new AssignmentDetailDto
        {
            Id = assignment.Id,
            Title = assignment.Title,
            Description = assignment.Description,
            DueDate = assignment.DueDate,
            MaxScore = assignment.MaxScore,
            CreatedAt = assignment.CreatedAt,
            ClassroomName = assignment.Classroom?.Name ?? "Không xác định",
            TeacherName = assignment.Classroom?.Teacher?.FullName ?? "Giáo viên",
            Files = assignment.AssignmentFiles?.Select(f => new AssignmentFileDto
            {
                Id = f.Id,
                FileName = f.FileName,
                FileUrl = f.FileUrl,
                FileSize = f.FileSize
            }).ToList() ?? new List<AssignmentFileDto>()
        };

        if (role?.ToLower() == "student")
        {
            var submission = await _context.Set<Submission>()
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == userId);

            dto.IsSubmitted = submission != null;

            if (submission != null)
            {
                dto.MySubmission = new SubmissionSummaryDto
                {
                    Id = submission.Id,
                    SubmittedAt = submission.SubmittedAt,
                    Score = submission.Score,
                    FileName = submission.FileName,
                    FileUrl = submission.FileUrl
                };
            }
        }
        else if (role?.ToLower() == "teacher")
        {
            dto.SubmissionCount = await _context.Set<Submission>()
                .CountAsync(s => s.AssignmentId == assignmentId);

            dto.TotalStudents = await _context.ClassroomMembers
                .CountAsync(m => m.ClassroomId == assignment.ClassroomId);
        }

        return dto;
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────
    public async Task<AssignmentResponseDto> CreateAsync(CreateAssignmentDto dto)
    {
        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            MaxScore = dto.MaxScore,
            ClassroomId = dto.ClassroomId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(assignment.Id);
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────
    public async Task UpdateAsync(Guid id, UpdateAssignmentDto dto)
    {
        var a = await _context.Assignments.FindAsync(id);
        if (a == null) return;

        a.Title = dto.Title;
        a.Description = dto.Description;
        a.DueDate = dto.DueDate;
        a.MaxScore = dto.MaxScore;

        await _context.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE assignment
    // ─────────────────────────────────────────────────────────────
    public async Task DeleteAsync(Guid id)
    {
        var a = await _context.Assignments.FindAsync(id);
        if (a == null) return;

        _context.Assignments.Remove(a);
        await _context.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────
    // UPLOAD FILE (cũ — giữ lại để không break)
    // ─────────────────────────────────────────────────────────────
    public async Task<FileDto> UploadFileAsync(Guid assignmentId, IFormFile file)
    {
        var assignmentFile = new AssignmentFile
        {
            Id = Guid.NewGuid(),
            FileName = file.FileName,
            FileUrl = $"/uploads/{file.FileName}",
            FileSize = file.Length,
            AssignmentId = assignmentId
        };

        _context.AssignmentFiles.Add(assignmentFile);
        await _context.SaveChangesAsync();

        return new FileDto(assignmentFile.Id, assignmentFile.FileName, assignmentFile.FileUrl, assignmentFile.FileSize);
    }

    // ─────────────────────────────────────────────────────────────
    // SAVE FILE (mới — dùng safeFileName từ Controller)
    // ─────────────────────────────────────────────────────────────
    public async Task SaveAssignmentFileAsync(Guid assignmentId, string fileUrl, string fileName, long fileSize)
    {
        var assignmentFile = new AssignmentFile
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            FileUrl = fileUrl,
            FileSize = fileSize,
            AssignmentId = assignmentId
        };

        _context.AssignmentFiles.Add(assignmentFile);
        await _context.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────
    // GET FILE (dùng để xoá file vật lý ở Controller)
    // ─────────────────────────────────────────────────────────────
    public async Task<AssignmentFileDto?> GetAssignmentFileAsync(Guid fileId)
    {
        var f = await _context.AssignmentFiles.FindAsync(fileId);
        if (f == null) return null;

        return new AssignmentFileDto
        {
            Id = f.Id,
            FileName = f.FileName,
            FileUrl = f.FileUrl,
            FileSize = f.FileSize
        };
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE FILE (record DB — file vật lý xoá ở Controller)
    // ─────────────────────────────────────────────────────────────
    public async Task DeleteFileAsync(Guid fileId)
    {
        var f = await _context.AssignmentFiles.FindAsync(fileId);
        if (f == null) return;

        _context.AssignmentFiles.Remove(f);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAssignmentFileAsync(Guid fileId)
        => await DeleteFileAsync(fileId);

    // ─────────────────────────────────────────────────────────────
    // ADD COMMENT
    // ─────────────────────────────────────────────────────────────
    public async Task AddCommentAsync(Guid assignmentId, Guid userId, string content)
    {
        // Nếu bạn có entity Comment, thêm vào đây.
        // Hiện tại để trống để build pass — bổ sung sau khi có entity.
        await Task.CompletedTask;
    }


    public async Task<List<AssignmentResponseDto>> GetUpcomingByClassAsync(Guid classId)
    {
        var now = DateTime.UtcNow;

        return await _context.Assignments
            .Where(a => a.ClassroomId == classId && a.DueDate > now)
            .OrderBy(a => a.DueDate)
            .Select(a => new AssignmentResponseDto(
                a.Id,
                a.Title,
                a.Description,
                a.DueDate,
                a.MaxScore,
                a.ClassroomId,
                a.CreatedAt,
                new List<FileDto>()
            ))
            .ToListAsync();
    }
}