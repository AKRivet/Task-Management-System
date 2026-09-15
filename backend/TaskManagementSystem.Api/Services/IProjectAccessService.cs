namespace TaskManagementSystem.Api.Services;

public interface IProjectAccessService
{
    // A Member has access to a project if they're an explicit member of it,
    // or have at least one work item assigned to them in it. Admins always
    // have access to everything.
    Task<bool> HasAccessAsync(int projectId);
    Task EnsureAccessAsync(int projectId);

    // Returns null for an Admin, meaning "no filter — everything is accessible."
    Task<List<int>?> GetAccessibleProjectIdsAsync();
}
