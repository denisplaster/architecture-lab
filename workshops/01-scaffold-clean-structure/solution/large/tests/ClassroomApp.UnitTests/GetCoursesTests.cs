using ClassroomApp.Application.Courses;
using ClassroomApp.Domain.Courses;

namespace ClassroomApp.UnitTests;

public class GetCoursesTests
{
    [Fact]
    public void Returns_every_course_from_the_repository()
    {
        var repository = new FakeCourseRepository([new(1, "Testing 101", "Dr. Okafor")]);

        var courses = new GetCourses(repository).Handle();

        Assert.Single(courses);
        Assert.Equal("Testing 101", courses[0].Title);
    }

    // No database and no web server: the use case is tested on its own.
    private class FakeCourseRepository(IReadOnlyList<Course> courses) : ICourseRepository
    {
        public IReadOnlyList<Course> GetAll() => courses;
    }
}
