using EduPlatform.Application.DTOs;
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
        if (a == null) return null;
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
        // Logic upload file tạm thời (Bạn có thể lưu vào wwwroot hoặc Cloud)
        var fileId = Guid.NewGuid();
        var assignmentFile = new AssignmentFile
        {
            Id = fileId,
            FileName = file.FileName,
            FileUrl = $"/uploads/{file.FileName}", // Demo URL
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