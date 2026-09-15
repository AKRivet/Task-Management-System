namespace TaskManagementSystem.Api.Entities;

// Models Features, Stories, Tasks and Bugs as one self-referencing entity
// (Type + ParentWorkItemId) rather than a separate table per type, mirroring
// how Azure DevOps itself stores work items.
public class WorkItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkItemType Type { get; set; } = WorkItemType.Task;
    public int ProjectId { get; set; }
    public int? AssignedUserId { get; set; }
    public int StatusId { get; set; }
    public WorkItemPriority Priority { get; set; } = WorkItemPriority.Medium;
    public int? ParentWorkItemId { get; set; }
    public DateOnly? DueDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Project Project { get; set; } = null!;
    public User? AssignedUser { get; set; }
    public Status Status { get; set; } = null!;
    public WorkItem? Parent { get; set; }
    public ICollection<WorkItem> Children { get; set; } = new List<WorkItem>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<WorkItemTag> WorkItemTags { get; set; } = new List<WorkItemTag>();
}
