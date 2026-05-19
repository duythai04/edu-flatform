using Microsoft.EntityFrameworkCore;
using EduPlatform.Application.Interfaces;
using EduPlatform.Infrastructure.Persistence;

namespace EduPlatform.Services
{
    public class ClassroomService : IClassroomService
    {
        private readonly AppDbContext _context;

        public ClassroomService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ClassroomDetailDto> GetClassroomDetailAsync(Guid classId, Guid userId)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Teacher)
                .Include(c => c.ClassroomMembers)
                .Include(c => c.Assignments)
                .FirstOrDefaultAsync(c => c.Id == classId);

            if (classroom == null) return null;

            bool isMember = classroom.TeacherId == userId ||
                            classroom.ClassroomMembers.Any(m => m.UserId == userId);

            if (!isMember) return null;

            return new ClassroomDetailDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                ClassCode = classroom.ClassCode,
                Description = classroom.Description,
                TeacherName = classroom.Teacher?.FullName ?? "N/A",
                StudentCount = classroom.ClassroomMembers?.Count ?? 0,
                Assignments = classroom.Assignments?.Select(a => new AssignmentDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    DueDate = a.DueDate
                }).ToList() ?? new List<AssignmentDto>()
            };
        }
    }
}