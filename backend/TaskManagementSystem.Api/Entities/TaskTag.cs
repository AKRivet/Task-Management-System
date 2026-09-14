namespace TaskManagementSystem.Api.Entities;

// Join entity for the many-to-many between Tasks and Tags.
public class TaskTag
{
    public int TaskId { get; set; }
    public int TagId { get; set; }

    public TaskItem Task { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
