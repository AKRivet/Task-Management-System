using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Data;

namespace TaskManagementSystem.Api.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(AppDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public IQueryable<T> Query() => DbSet.AsQueryable();

    public async Task<T?> GetByIdAsync(params object[] keyValues) => await DbSet.FindAsync(keyValues);

    public async Task AddAsync(T entity) => await DbSet.AddAsync(entity);

    public void Remove(T entity) => DbSet.Remove(entity);

    public async Task<bool> SaveChangesAsync() => await Context.SaveChangesAsync() >= 0;
}
