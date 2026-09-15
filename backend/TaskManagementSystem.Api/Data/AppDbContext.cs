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
    public DbSet<WorkItem> WorkItems => Set<WorkItem>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<WorkItemTag> WorkItemTags => Set<WorkItemTag>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);

            // Seeded so there's always a way to log in on a fresh database.
            // Password is "Admin@123" (see README) — hash precomputed with BCrypt.Net-Next.
            entity.HasData(new User
            {
                Id = 1,
                Name = "Admin",
                Email = "admin@taskms.local",
                PasswordHash = "$2a$11$yv.f2Z1nd3cSVq0lKN/TzubUO3Xl1WqUnipSqeG0e/rY1.OvZFCGe",
                Role = UserRole.Admin,
                CreatedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero),
            });
        });

        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasKey(pm => new { pm.ProjectId, pm.UserId });

            entity.HasOne(pm => pm.Project)
                .WithMany(p => p.Members)
                .HasForeignKey(pm => pm.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(pm => pm.User)
                .WithMany(u => u.ProjectMemberships)
                .HasForeignKey(pm => pm.UserId)
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

        modelBuilder.Entity<WorkItem>(entity =>
        {
            // Priority/Type are stored as text (not a plain int) so the columns are
            // human-readable in the database, with CHECK constraints doing the
            // validation Postgres's native enum type would otherwise do.
            entity.Property(w => w.Priority).HasConversion<string>().HasMaxLength(20);
            entity.Property(w => w.Type).HasConversion<string>().HasMaxLength(20);
            entity.ToTable(w =>
            {
                w.HasCheckConstraint("ck_work_items_priority", "priority IN ('Low', 'Medium', 'High', 'Critical')");
                w.HasCheckConstraint("ck_work_items_type", "type IN ('Feature', 'Story', 'Task', 'Bug')");
            });

            entity.HasOne(w => w.Project)
                .WithMany(p => p.WorkItems)
                .HasForeignKey(w => w.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.AssignedUser)
                .WithMany(u => u.AssignedWorkItems)
                .HasForeignKey(w => w.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(w => w.Status)
                .WithMany(s => s.WorkItems)
                .HasForeignKey(w => w.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            // Self-referencing hierarchy (Feature -> Story -> Task/Bug, or sub-tasks).
            // Deleting a parent cascades to its whole subtree, same as deleting a
            // project cascades to its work items.
            entity.HasOne(w => w.Parent)
                .WithMany(w => w.Children)
                .HasForeignKey(w => w.ParentWorkItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(w => w.ProjectId);
            entity.HasIndex(w => w.StatusId);
            entity.HasIndex(w => w.ParentWorkItemId);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasOne(c => c.WorkItem)
                .WithMany(w => w.Comments)
                .HasForeignKey(c => c.WorkItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(c => c.WorkItemId);
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasIndex(t => t.Name).IsUnique();
        });

        modelBuilder.Entity<WorkItemTag>(entity =>
        {
            entity.HasKey(wt => new { wt.WorkItemId, wt.TagId });

            entity.HasOne(wt => wt.WorkItem)
                .WithMany(w => w.WorkItemTags)
                .HasForeignKey(wt => wt.WorkItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(wt => wt.Tag)
                .WithMany(t => t.WorkItemTags)
                .HasForeignKey(wt => wt.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
