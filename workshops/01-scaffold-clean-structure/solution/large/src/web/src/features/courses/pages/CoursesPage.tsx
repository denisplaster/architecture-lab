import { CourseCard } from '../components/CourseCard'
import { useCourses } from '../hooks/useCourses'

export function CoursesPage() {
  const { courses, error } = useCourses()

  return (
    <main>
      <h1>Courses</h1>
      {error && <p role="alert">Could not load courses: {error}</p>}
      <ul className="cards">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </ul>
    </main>
  )
}
