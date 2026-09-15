namespace TaskManagementSystem.Api.Entities;

public class Status
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
}
