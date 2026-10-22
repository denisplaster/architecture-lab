using ClassroomApp.Api.Data;

namespace ClassroomApp.Api.Endpoints;

public static class CourseEndpoints
{
    public static void MapCourseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/courses");

        group.MapGet("/", (CourseStore store) => store.GetAll());
    }
}
