namespace TaskManagementSystem.Api.DTOs;

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

public record ProjectQuery(string? Search, string? SortBy, string? SortDir, int Page = 1, int PageSize = 10);
