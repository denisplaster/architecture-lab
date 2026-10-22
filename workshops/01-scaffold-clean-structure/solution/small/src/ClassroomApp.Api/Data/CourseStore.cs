using ClassroomApp.Api.Models;

namespace ClassroomApp.Api.Data;

// Stands in for a database for now. Swap it for EF Core later.
public class CourseStore
{
    private readonly List<Course> _courses =
    [
        new(1, "Software Architecture", "Ms. Rivera"),
        new(2, "Intro to React", "Mr. Chen"),
    ];

    public IReadOnlyList<Course> GetAll() => _courses;
}
