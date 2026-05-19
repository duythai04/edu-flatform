using System;
using System.Collections.Generic;

namespace EduPlatform.Application.DTOs
{
    // DTO để tạo bài tập mới
    public record CreateAssignmentDto(
        string Title,
        string Description,
        DateTime DueDate,
        double MaxScore,
        Guid ClassroomId
    );

    // DTO để cập nhật bài tập
    public record UpdateAssignmentDto(
        string Title,
        string Description,
        DateTime DueDate,
        double MaxScore
    );

    // DTO cho thông tin file đính kèm
    public record FileDto(
        Guid Id,
        string FileName,
        string FileUrl,
        long FileSize
    );

    // DTO để trả về dữ liệu chi tiết bài tập kèm danh sách file
    public record AssignmentResponseDto(
        Guid Id,
        string Title,
        string Description,
        DateTime DueDate,
        double MaxScore,
        Guid ClassroomId,
        DateTime CreatedAt,
        List<FileDto> Files
    );
}