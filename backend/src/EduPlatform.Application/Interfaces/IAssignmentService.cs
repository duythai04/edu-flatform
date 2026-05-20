using EduPlatform.Application.DTOs.Assignment;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EduPlatform.Application.Interfaces
{
    public interface IAssignmentService
    {

        Task<IEnumerable<AssignmentResponseDto>> GetAllAsync();

        Task<AssignmentResponseDto> GetByIdAsync(Guid id);

        Task<AssignmentResponseDto> CreateAsync(CreateAssignmentDto dto);

        Task UpdateAsync(Guid id, UpdateAssignmentDto dto);

        Task DeleteAsync(Guid id);

        Task<FileDto> UploadFileAsync(Guid assignmentId, IFormFile file);

        Task DeleteFileAsync(Guid fileId);

        Task<AssignmentDetailDto> GetDetailAsync(Guid assignmentId, Guid userId, string role);
    }
}