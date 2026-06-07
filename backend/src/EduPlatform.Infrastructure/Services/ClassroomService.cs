using Microsoft.EntityFrameworkCore;
using EduPlatform.Application.Interfaces;
using EduPlatform.Infrastructure.Persistence;

namespace EduPlatform.Infrastructure.Services
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
                .AsNoTracking()
                .Include(c => c.Teacher)
                .Include(c => c.ClassroomMembers)
                .Include(c => c.Assignments)
                .ThenInclude(a => a.Submissions)
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
                Color = classroom.Color,
                TeacherName = classroom.Teacher?.FullName ?? "N/A",
                StudentCount = classroom.ClassroomMembers?.Count ?? 0,
                // MỚI
                Assignments = classroom.Assignments?.Select(a => new AssignmentDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    DueDate = a.DueDate,
                    SubmissionStatus = a.Submissions.Any(s => s.StudentId == userId)
                        ? (a.Submissions.First(s => s.StudentId == userId).SubmittedAt > a.DueDate
                            ? "late"
                            : "submitted")
                        : "missing"
                }).ToList() ?? new List<AssignmentDto>()
            };
        }
    }
}