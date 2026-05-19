using EduPlatform.Domain.Entities;
using EduPlatform.Domain.Common;
public class AssignmentFile : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }

    public Guid AssignmentId { get; set; }
    public virtual Assignment Assignment { get; set; } = null!;
}