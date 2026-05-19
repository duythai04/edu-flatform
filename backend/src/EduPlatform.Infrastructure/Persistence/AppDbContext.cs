using EduPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<Classroom> Classrooms { get; set; }

    public DbSet<ClassroomMember> ClassroomMembers { get; set; }

    public DbSet<Assignment> Assignments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cấu hình quan hệ 1-nhiều giữa Classroom và Assignment
        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Classroom)
            .WithMany(c => c.Assignments)
            .HasForeignKey(a => a.ClassroomId);
    }
}