using System;

namespace EduPlatform.Application.DTOs

{
    // DTO để tạo thông báo mới
    public record CreateAnnouncementDto(
        string Title,
        string Content,
        Guid ClassroomId
    );

    // DTO để cập nhật thông báo hiện có
    public record UpdateAnnouncementDto(
        string Title,
        string Content
    );

    // DTO để trả về dữ liệu thông báo cho Frontend
    public record AnnouncementResponseDto(
        Guid Id,
        string Title,
        string Content,
        Guid ClassroomId,
        string TeacherId,
        DateTime CreatedAt
    );
}