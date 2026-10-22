using ClassroomApp.Api.Endpoints;
using ClassroomApp.Application.Courses;
using ClassroomApp.Infrastructure.Courses;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Program.cs is the one place that connects interfaces to implementations.
builder.Services.AddSingleton<ICourseRepository, InMemoryCourseRepository>();
builder.Services.AddScoped<GetCourses>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapCourseEndpoints();

app.Run();
