namespace TaskManagementSystem.Api.Entities;

public class Comment
{
    public int Id { get; set; }
    public int WorkItemId { get; set; }
    public int UserId { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public WorkItem WorkItem { get; set; } = null!;
    public User User { get; set; } = null!;
}
