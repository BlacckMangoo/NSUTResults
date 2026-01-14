import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import type { Student } from '../types'
import { parseStudents } from '../utils/csvParser'

export function useStudentData() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/results.csv')
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
  }, [])

  return { students, loading }
}
