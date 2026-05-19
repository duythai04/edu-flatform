using EduPlatform.Domain.Common;

namespace EduPlatform.Domain.Entities
{
    public class Assignment : BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public Guid ClassroomId { get; set; }
        public virtual Classroom Classroom { get; set; }
    }
}