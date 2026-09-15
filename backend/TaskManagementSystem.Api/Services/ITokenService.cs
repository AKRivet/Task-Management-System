using TaskManagementSystem.Api.Entities;

namespace TaskManagementSystem.Api.Services;

public interface ITokenService
{
    string CreateToken(User user);
}
