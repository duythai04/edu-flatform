using EduPlatform.Application.DTOs;


namespace EduPlatform.Application.Interfaces

{
    public interface IAnnouncementService
    {
        Task<IEnumerable<AnnouncementResponseDto>> GetByClassRoomAsync(Guid classId);
        Task<AnnouncementResponseDto> GetByIdAsync(Guid id);
        Task<AnnouncementResponseDto> CreateAsync(CreateAnnouncementDto dto, string teacherId);
        Task UpdateAsync(Guid id, UpdateAnnouncementDto dto);
        Task DeleteAsync(Guid id);
    }


}
