namespace TaskManagementSystem.Api.Entities;

// Named "TaskItem" (not "Task") to avoid colliding with System.Threading.Tasks.Task.
public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ProjectId { get; set; }
    public int? AssignedUserId { get; set; }
    public int StatusId { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateOnly? DueDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Project Project { get; set; } = null!;
    public User? AssignedUser { get; set; }
    public Status Status { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
}
