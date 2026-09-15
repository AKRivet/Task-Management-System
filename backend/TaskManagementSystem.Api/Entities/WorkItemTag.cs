namespace TaskManagementSystem.Api.Entities;

// Join entity for the many-to-many between WorkItems and Tags.
public class WorkItemTag
{
    public int WorkItemId { get; set; }
    public int TagId { get; set; }

    public WorkItem WorkItem { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
