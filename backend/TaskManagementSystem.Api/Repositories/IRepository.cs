namespace TaskManagementSystem.Api.Repositories;

// Thin wrapper around a DbSet<T>. EF Core's DbContext already IS a
// unit-of-work/repository, so this deliberately stays thin (no query logic
// beyond exposing IQueryable) rather than re-implementing EF Core badly.
public interface IRepository<T> where T : class
{
    IQueryable<T> Query();
    Task<T?> GetByIdAsync(params object[] keyValues);
    Task AddAsync(T entity);
    void Remove(T entity);
    Task<bool> SaveChangesAsync();
}
