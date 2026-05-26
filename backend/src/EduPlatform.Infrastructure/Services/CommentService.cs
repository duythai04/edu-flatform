using EduPlatform.Infrastructure.Persistence;
using EduPlatform.Application.DTOs.Comments;
using EduPlatform.Application.Interfaces;
using EduPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Services;

public class CommentService : ICommentService
{
    private readonly AppDbContext _context;

    public CommentService(AppDbContext context)
    {
        _context = context;
    }

    // GET
    public async Task<List<CommentResponseDto>> GetByClassroomAsync(
        Guid classroomId,
        Guid currentUserId,
        Guid? announcementId,
        Guid? assignmentId)
    {
        var query = _context.Comments
            .Where(c => c.ClassroomId == classroomId
                     && c.ParentCommentId == null
                     && !c.IsDeleted);

        if (announcementId.HasValue)
            query = query.Where(c => c.AnnouncementId == announcementId);

        if (assignmentId.HasValue)
            query = query.Where(c => c.AssignmentId == assignmentId);

        var comments = await query
            .Include(c => c.User)
            .Include(c => c.Replies.Where(r => !r.IsDeleted))
                .ThenInclude(r => r.User)
            .OrderByDescending(c => c.CreateAt)
            .ToListAsync();

        return comments.Select(c => MapToDto(c, currentUserId)).ToList();
    }

    // CREATE
    public async Task<CommentResponseDto> CreateAsync(
        CreateCommentDto dto, Guid currentUserId)
    {
        if (dto.ParentCommentId.HasValue)
        {
            var parent = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == dto.ParentCommentId && !c.IsDeleted)
                ?? throw new KeyNotFoundException("Comment cha không tồn tại");

            if (parent.ParentCommentId.HasValue)
                throw new InvalidOperationException("Chỉ được reply 1 cấp");
        }

        var comment = new Comment
        {
            Content = dto.Content.Trim(),
            ClassroomId = dto.ClassroomId,
            UserId = currentUserId,
            ParentCommentId = dto.ParentCommentId,
            AnnouncementId = dto.AnnouncementId,
            AssignmentId = dto.AssignmentId,
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        await _context.Entry(comment)
            .Reference(c => c.User)
            .LoadAsync();

        return MapToDto(comment, currentUserId);
    }

    // UPDATE
    public async Task<CommentResponseDto> UpdateAsync(
        Guid commentId, UpdateCommentDto dto, Guid currentUserId)
    {
        var comment = await _context.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == commentId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Không tìm thấy comment");

        if (comment.UserId != currentUserId)
            throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa comment này");

        comment.Content = dto.Content.Trim();
        comment.UpdateAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(comment, currentUserId);
    }

    // DELETE
    public async Task DeleteAsync(Guid commentId, Guid currentUserId)
    {
        var comment = await _context.Comments
            .Include(c => c.Replies)
            .FirstOrDefaultAsync(c => c.Id == commentId && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Không tìm thấy comment");

        if (comment.UserId != currentUserId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa comment này");

        comment.IsDeleted = true;

        foreach (var reply in comment.Replies)
            reply.IsDeleted = true;

        await _context.SaveChangesAsync();
    }

    // MAPPER
    private CommentResponseDto MapToDto(Comment c, Guid currentUserId)
    {
        return new CommentResponseDto
        {
            Id = c.Id,
            Content = c.Content,
            UserName = c.User?.FullName ?? "",
            UserId = c.UserId,
            CreatedAt = c.CreateAt,
            UpdatedAt = c.UpdateAt,
            ParentCommentId = c.ParentCommentId,
            IsOwner = c.UserId == currentUserId,
            Replies = c.Replies?
                                .Where(r => !r.IsDeleted)
                                .Select(r => MapToDto(r, currentUserId))
                                .ToList() ?? new()
        };
    }
}