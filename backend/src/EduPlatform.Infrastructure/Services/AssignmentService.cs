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

    public async Task<AssignmentDetailDto> GetDetailAsync(Guid assignmentId, Guid userId, string role)
    {
        // 1. Lấy Assignment kèm Files và thông tin Classroom/Teacher
        // Sử dụng Include để lấy dữ liệu từ các bảng liên quan trong 1 lần truy vấn
        var assignment = await _context.Assignments
            .Include(a => a.AssignmentFiles)
            .Include(a => a.Classroom)
                .ThenInclude(c => c.Teacher)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null) throw new Exception("Assignment not found");

        // 2. Map dữ liệu cơ bản vào DTO
        var dto = new AssignmentDetailDto
        {
            Id = assignment.Id,
            Title = assignment.Title,
            Description = assignment.Description,
            DueDate = assignment.DueDate,
            MaxScore = assignment.MaxScore,
            // Thêm kiểm tra null an toàn cho Classroom và Teacher
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

        // 3. Logic xử lý theo Vai trò (Role)
        if (role == "Student")
        {
            // Kiểm tra học sinh hiện tại đã nộp bài này chưa
            var submission = await _context.Set<Submission>()
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == userId);

            dto.IsSubmitted = submission != null;

            if (submission != null)
            {
                // Map thông tin bài nộp vào Object MySubmission trong DTO
                dto.MySubmission = new SubmissionSummaryDto
                {
                    Id = submission.Id,
                    SubmittedAt = submission.SubmittedAt,
                    Score = submission.Score
                };
            }
        }
        else if (role == "Teacher")
        {
            // Nếu là giáo viên, đếm tổng số lượt nộp bài
            dto.SubmissionCount = await _context.Set<Submission>()
                .CountAsync(s => s.AssignmentId == assignmentId);
        }

        return dto;
    }

    public async Task<IEnumerable<AssignmentResponseDto>> GetAllAsync()
    {
        return await _context.Assignments
            .Include(a => a.AssignmentFiles)
            .Select(a => new AssignmentResponseDto(
                a.Id, a.Title, a.Description, a.DueDate, a.MaxScore, a.ClassroomId, a.CreatedAt,
                a.AssignmentFiles.Select(f => new FileDto(f.Id, f.FileName, f.FileUrl, f.FileSize)).ToList()
            )).ToListAsync();
    }

    public async Task<AssignmentResponseDto> GetByIdAsync(Guid id)
    {
        var a = await _context.Assignments.Include(x => x.AssignmentFiles).FirstOrDefaultAsync(x => x.Id == id);
        if (a == null) return null!;
        return new AssignmentResponseDto(
            a.Id, a.Title, a.Description, a.DueDate, a.MaxScore, a.ClassroomId, a.CreatedAt,
            a.AssignmentFiles.Select(f => new FileDto(f.Id, f.FileName, f.FileUrl, f.FileSize)).ToList()
        );
    }

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

    public async Task UpdateAsync(Guid id, UpdateAssignmentDto dto)
    {
        var a = await _context.Assignments.FindAsync(id);
        if (a != null)
        {
            a.Title = dto.Title;
            a.Description = dto.Description;
            a.DueDate = dto.DueDate;
            a.MaxScore = dto.MaxScore;
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        var a = await _context.Assignments.FindAsync(id);
        if (a != null)
        {
            _context.Assignments.Remove(a);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<FileDto> UploadFileAsync(Guid assignmentId, IFormFile file)
    {
        var fileId = Guid.NewGuid();
        var assignmentFile = new AssignmentFile
        {
            Id = fileId,
            FileName = file.FileName,
            FileUrl = $"/uploads/{file.FileName}",
            FileSize = file.Length,
            AssignmentId = assignmentId
        };

        _context.AssignmentFiles.Add(assignmentFile);
        await _context.SaveChangesAsync();

        return new FileDto(assignmentFile.Id, assignmentFile.FileName, assignmentFile.FileUrl, assignmentFile.FileSize);
    }

    public async Task DeleteFileAsync(Guid fileId)
    {
        var file = await _context.AssignmentFiles.FindAsync(fileId);
        if (file != null)
        {
            _context.AssignmentFiles.Remove(file);
            await _context.SaveChangesAsync();
        }
    }
}