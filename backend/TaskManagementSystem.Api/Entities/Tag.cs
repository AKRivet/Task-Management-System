namespace TaskManagementSystem.Api.Entities;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<WorkItemTag> WorkItemTags { get; set; } = new List<WorkItemTag>();
}
