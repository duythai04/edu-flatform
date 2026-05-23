namespace EduPlatform.Application.DTOs.Assignment;

public class AssignmentFileDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
}

public class AssignmentDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public double MaxScore { get; set; }
    public string ClassroomName { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public List<AssignmentFileDto> Files { get; set; } = new();

    public bool IsSubmitted { get; set; }
    public SubmissionSummaryDto? MySubmission { get; set; }

    public int SubmissionCount { get; set; }
    public int TotalStudents { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class SubmissionSummaryDto
{
    public Guid Id { get; set; }
    public DateTime SubmittedAt { get; set; }
    public double? Score { get; set; }

    public string? FileName { get; set; }
    public string? FileUrl { get; set; }
    public string? TeacherComment { get; set; }
}