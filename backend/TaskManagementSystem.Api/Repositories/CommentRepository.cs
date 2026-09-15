using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Data;
using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Repositories;

public class CommentRepository : Repository<Comment>, ICommentRepository
{
    public CommentRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<Comment>> GetByWorkItemIdAsync(int workItemId) =>
        await DbSet
            .Include(c => c.User)
            .Where(c => c.WorkItemId == workItemId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
}
