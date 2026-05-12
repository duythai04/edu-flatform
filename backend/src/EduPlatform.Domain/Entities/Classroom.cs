using EduPlatform.Domain.Common;

namespace EduPlatform.Domain.Entities;

public class Classroom : BaseEntity
{
    public string Name { get; set; }

    public string Description { get; set; }

    public string ClassCode { get; set; }

    public Guid TeacherId { get; set; }

    public User Teacher { get; set; }
}