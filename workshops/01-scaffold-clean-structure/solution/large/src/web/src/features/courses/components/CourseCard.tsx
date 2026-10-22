import type { Course } from '../types'

export function CourseCard({ course }: { course: Course }) {
  return (
    <li className="card">
      <strong>{course.title}</strong>
      <span>{course.teacher}</span>
    </li>
  )
}
