using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<TaskTag> TaskTags => Set<TaskTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasOne(p => p.Owner)
                .WithMany(u => u.OwnedProjects)
                .HasForeignKey(p => p.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Status>(entity =>
        {
            entity.HasIndex(s => s.Name).IsUnique();

            // Seeded lookup values so a fresh database is immediately usable.
            entity.HasData(
                new Status { Id = 1, Name = "To Do" },
                new Status { Id = 2, Name = "In Progress" },
                new Status { Id = 3, Name = "Done" },
                new Status { Id = 4, Name = "Blocked" }
            );
        });

        modelBuilder.Entity<TaskItem>(entity =>
        {
            // Priority is stored as text (not a plain int) so the column is
            // human-readable in the database, with a CHECK constraint doing
            // the validation Postgres's native enum type would otherwise do.
            entity.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20);
            entity.ToTable(t => t.HasCheckConstraint(
                "ck_tasks_priority",
                "priority IN ('Low', 'Medium', 'High', 'Critical')"
            ));

            entity.HasOne(t => t.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.AssignedUser)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(t => t.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(t => t.Status)
                .WithMany(s => s.Tasks)
                .HasForeignKey(t => t.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(t => t.ProjectId);
            entity.HasIndex(t => t.StatusId);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasOne(c => c.Task)
                .WithMany(t => t.Comments)
                .HasForeignKey(c => c.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(c => c.TaskId);
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasIndex(t => t.Name).IsUnique();
        });

        modelBuilder.Entity<TaskTag>(entity =>
        {
            entity.HasKey(tt => new { tt.TaskId, tt.TagId });

            entity.HasOne(tt => tt.Task)
                .WithMany(t => t.TaskTags)
                .HasForeignKey(tt => tt.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tt => tt.Tag)
                .WithMany(t => t.TaskTags)
                .HasForeignKey(tt => tt.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
