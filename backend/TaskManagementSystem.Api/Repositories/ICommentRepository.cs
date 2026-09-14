using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Repositories;

public interface ICommentRepository : IRepository<Comment>
{
    Task<List<Comment>> GetByTaskIdAsync(int taskId);
}
