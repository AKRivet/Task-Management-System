namespace TaskManagementSystem.Api.Entities;

// Join entity for the many-to-many between Projects and Users — replaces the
// old single OwnerUserId, and is what drives "which projects can a Member see."
public class ProjectMember
{
    public int ProjectId { get; set; }
    public int UserId { get; set; }

    public Project Project { get; set; } = null!;
    public User User { get; set; } = null!;
}
