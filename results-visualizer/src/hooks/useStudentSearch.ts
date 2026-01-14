import { useMemo } from 'react'
import type { Student } from '../types'

export function useStudentSearch(students: Student[], search: string) {
  return useMemo(() => {
    if (!search.trim()) return []
    const query = search.toLowerCase()
    return students
      .filter(s => 
        s.rollNo.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query)
      )
      .slice(0, 10)
  }, [students, search])
}
