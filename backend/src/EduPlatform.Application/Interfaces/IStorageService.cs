using EduPlatform.Application.DTOs;
public interface IStorageService
{
    Task<string> UploadAsync(string bucket, string fileName, Stream stream, string contentType);
    Task DeleteAsync(string bucket, string fileUrl);
}