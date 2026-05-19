using EduPlatform.Application.DTOs;

namespace EduPlatform.Application.Interfaces
{
    public interface IClassroomService
    {

        Task<ClassroomDetailDto> GetClassroomDetailAsync(Guid classId, Guid userId);


    }
}