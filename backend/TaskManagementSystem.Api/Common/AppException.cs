using Microsoft.AspNetCore.Http;

namespace TaskManagementSystem.Api.Common;

// A single exception type carrying an HTTP status code, so services can
// signal "not found" / "conflict" / "bad request" without every controller
// needing its own try/catch — ExceptionHandlingMiddleware converts these
// into the matching HTTP response.
public class AppException : Exception
{
    public int StatusCode { get; }

    private AppException(string message, int statusCode) : base(message)
    {
        StatusCode = statusCode;
    }

    public static AppException NotFound(string message) => new(message, StatusCodes.Status404NotFound);
    public static AppException Conflict(string message) => new(message, StatusCodes.Status409Conflict);
    public static AppException BadRequest(string message) => new(message, StatusCodes.Status400BadRequest);
}
