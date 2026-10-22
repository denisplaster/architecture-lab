import { useEffect, useState } from 'react'
import { getCourses } from '../api/getCourses'
import type { Course } from '../types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((e: Error) => setError(e.message))
  }, [])

  return { courses, error }
}
