namespace EduPlatform.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }



}