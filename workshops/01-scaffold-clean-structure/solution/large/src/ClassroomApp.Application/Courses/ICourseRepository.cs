using ClassroomApp.Domain.Courses;

namespace ClassroomApp.Application.Courses;

// Application says WHAT it needs. Infrastructure decides HOW.
public interface ICourseRepository
{
    IReadOnlyList<Course> GetAll();
}
