using EduPlatform.Domain.Common;

namespace EduPlatform.Domain.Entities
{

    public class Submission : BaseEntity
    {
        public Guid AssignmentId { get; set; }
        public virtual Assignment Assignment { get; set; }

        public Guid StudentId { get; set; }
        public virtual User Student { get; set; }

        public string Content { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.Now;
        public double? Score { get; set; }
    }

}
