using EduPlatform.Domain.Common;
using System;

namespace EduPlatform.Domain.Entities
{
    public class Announcement : BaseEntity
    {


        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        public Guid ClassRoomId { get; set; }
        public virtual Classroom Classroom { get; set; } = null!;

        public string TeacherId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}