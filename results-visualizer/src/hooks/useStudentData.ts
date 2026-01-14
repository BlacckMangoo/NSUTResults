import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import type { Student, Semester } from '../types'
import { parseStudents } from '../utils/csvParser'

const CSV_FILES: Record<Semester, string> = {
  'sem1': 'results_sem1.csv',
  'sem3': 'results.csv',
  'sem5': 'results_sem5.csv',
  'sem7': 'results_sem7.csv',
}

export function useStudentData(semester: Semester) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const baseUrl = import.meta.env.BASE_URL || '/'
    fetch(`${baseUrl}${CSV_FILES[semester]}`)
      .then(res => res.text())
      .then(text => {
        const result = Papa.parse<string[]>(text)
        const parsed = parseStudents(result.data)
        setStudents(parsed)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading CSV:', err)
        setLoading(false)
      })
  }, [semester])

  return { students, loading }
}
