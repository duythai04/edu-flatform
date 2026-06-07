
using EduPlatform.Infrastructure.Persistence;

public class SupabaseStorageService : IStorageService
{
    private readonly Supabase.Client _supabase;

    public SupabaseStorageService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<string> UploadAsync(string bucket, string fileName, Stream stream, string contentType)
    {
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        var bytes = ms.ToArray();

        await _supabase.Storage
            .From(bucket)
            .Upload(bytes, fileName, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = false
            });

        // Trả về public URL
        return _supabase.Storage.From(bucket).GetPublicUrl(fileName);
    }

    public async Task DeleteAsync(string bucket, string fileUrl)
    {

        var uri = new Uri(fileUrl);
        var segments = uri.AbsolutePath.Split($"/object/public/{bucket}/");
        if (segments.Length < 2) return;

        var filePath = segments[1];
        await _supabase.Storage.From(bucket).Remove(new List<string> { filePath });
    }
}