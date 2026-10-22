import { getJson } from '../../../shared/lib/http'
import type { Course } from '../types'

export function getCourses() {
  return getJson<Course[]>('/api/courses')
}
