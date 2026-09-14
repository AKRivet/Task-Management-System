using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Api.Common;

namespace TaskManagementSystem.Api.Middleware;

// Central place to turn exceptions into consistent JSON error responses,
// instead of every controller action needing its own try/catch.
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            await WriteError(context, ex.StatusCode, ex.Message);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "Database update conflict");
            await WriteError(
                context,
                StatusCodes.Status409Conflict,
                "The operation could not be completed because it conflicts with related data (e.g. a foreign key constraint)."
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteError(context, StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
        }
    }

    private static Task WriteError(HttpContext context, int statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { error = message }));
    }
}
