using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Repositories;

public interface ICommentRepository : IRepository<Comment>
{
    Task<List<Comment>> GetByWorkItemIdAsync(int workItemId);
}
