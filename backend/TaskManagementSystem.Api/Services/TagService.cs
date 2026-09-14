using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;
using TaskManagementSystem.Api.DTOs;
using TaskManagementSystem.Api.Entities;
using TaskManagementSystem.Api.Repositories;

namespace TaskManagementSystem.Api.Services;

public class TagService : ITagService
{
    private readonly IRepository<Tag> _tags;

    public TagService(IRepository<Tag> tags)
    {
        _tags = tags;
    }

    public async Task<List<TagResponse>> GetAllAsync()
    {
        var tags = await _tags.Query().OrderBy(t => t.Name).ToListAsync();
        return tags.Select(t => new TagResponse(t.Id, t.Name)).ToList();
    }

    public async Task<TagResponse> CreateAsync(CreateTagRequest request)
    {
        var exists = await _tags.Query().AnyAsync(t => t.Name == request.Name);
        if (exists)
            throw AppException.Conflict($"Tag '{request.Name}' already exists.");

        var tag = new Tag { Name = request.Name };
        await _tags.AddAsync(tag);
        await _tags.SaveChangesAsync();
        return new TagResponse(tag.Id, tag.Name);
    }

    public async Task DeleteAsync(int id)
    {
        var tag = await _tags.GetByIdAsync(id) ?? throw AppException.NotFound($"Tag {id} not found.");
        _tags.Remove(tag);
        await _tags.SaveChangesAsync();
    }
}
