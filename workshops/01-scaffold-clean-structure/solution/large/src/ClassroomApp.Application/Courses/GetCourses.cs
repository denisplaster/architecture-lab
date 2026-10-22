using ClassroomApp.Domain.Courses;

namespace ClassroomApp.Application.Courses;

// One use case. Business rules for listing courses live here.
public class GetCourses(ICourseRepository courses)
{
    public IReadOnlyList<Course> Handle() => courses.GetAll();
}
