using EduPlatform.Application.DTOs.Classroom;

public class ClassroomDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string ClassCode { get; set; }
    public string Description { get; set; }
    public string TeacherName { get; set; }
    public int StudentCount { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<AssignmentDto> Assignments { get; set; }
}

public class AssignmentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public DateTime DueDate { get; set; }
}