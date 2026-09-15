namespace TaskManagementSystem.Api.Entities;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
}
