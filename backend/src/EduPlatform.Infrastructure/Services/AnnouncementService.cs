using EduPlatform.Application.DTOs;
using EduPlatform.Application.Interfaces;
using EduPlatform.Domain.Entities;
using EduPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace EduPlatform.Infrastructure.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly AppDbContext _context;

    public AnnouncementService(AppDbContext context)
    {
        _context = context; 
    }

    public async Task<IEnumerable<AnnouncementResponseDto>> GetByClassRoomAsync(Guid classId)
    {
        return await _context.Announcements
            .Where(a => a.ClassRoomId == classId)
            .Select(a => new AnnouncementResponseDto(
                a.Id, 
                a.Title, 
                a.Content, 
                a.ClassRoomId, 
                a.TeacherId, 
                a.CreatedAt)) 
            .ToListAsync();
    }

    public async Task<AnnouncementResponseDto> GetByIdAsync(Guid id)
    {
        var a = await _context.Announcements.FindAsync(id);
        if (a == null) return null!;

        return new AnnouncementResponseDto(
            a.Id, 
            a.Title, 
            a.Content, 
            a.ClassRoomId, 
            a.TeacherId, 
            a.CreatedAt);
    }

    public async Task<AnnouncementResponseDto> CreateAsync(CreateAnnouncementDto dto, string teacherId)
    {
        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Content = dto.Content,
            ClassRoomId = dto.ClassroomId,
            TeacherId = teacherId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(announcement.Id);
    }

    public async Task UpdateAsync(Guid id, UpdateAnnouncementDto dto)
    {
        var a = await _context.Announcements.FindAsync(id);
        if (a != null)
        {
            a.Title = dto.Title;
            a.Content = dto.Content;
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        var a = await _context.Announcements.FindAsync(id);
        if (a != null)
        {
            _context.Announcements.Remove(a);
            await _context.SaveChangesAsync();
        }
    }
}