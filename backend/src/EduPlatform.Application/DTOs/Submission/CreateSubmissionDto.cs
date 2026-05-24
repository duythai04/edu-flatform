namespace EduPlatform.Application.DTOs.Submission;

public class SubmissionDto
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string? Content { get; set; }
    public DateTime SubmittedAt { get; set; }
    public double? Score { get; set; }
}

public class GradeSubmissionDto
{
    public double Score { get; set; }
}