using ClassroomApp.Application.Courses;
using ClassroomApp.Domain.Courses;

namespace ClassroomApp.Infrastructure.Courses;

// Today a list in memory, later EF Core. Only this project changes.
public class InMemoryCourseRepository : ICourseRepository
{
    private readonly List<Course> _courses =
    [
        new(1, "Software Architecture", "Ms. Rivera"),
        new(2, "Intro to React", "Mr. Chen"),
    ];

    public IReadOnlyList<Course> GetAll() => _courses;
}
