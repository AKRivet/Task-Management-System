namespace TaskManagementSystem.Api.Entities;

public class Comment
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public TaskItem Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
