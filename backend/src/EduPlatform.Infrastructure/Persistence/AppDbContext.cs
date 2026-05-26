using EduPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Classroom> Classrooms { get; set; }
    public DbSet<ClassroomMember> ClassroomMembers { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<AssignmentFile> AssignmentFiles { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<Comment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //  Assignment → Classroom
        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Classroom)
            .WithMany(c => c.Assignments)
            .HasForeignKey(a => a.ClassroomId)
            .OnDelete(DeleteBehavior.Cascade);

        // Comment self-reference (reply 1 cấp)
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        //  Comment → Classroom
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Classroom)
            .WithMany(c => c.Comments)
            .HasForeignKey(c => c.ClassroomId)
            .OnDelete(DeleteBehavior.NoAction);

        //  Comment → User 
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}