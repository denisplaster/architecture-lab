import { useEffect, useState } from 'react'
import { getJson } from '../lib/api'
import type { Course } from '../types/course'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getJson<Course[]>('/api/courses')
      .then(setCourses)
      .catch((e: Error) => setError(e.message))
  }, [])

  return { courses, error }
}
