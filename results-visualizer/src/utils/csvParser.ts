import type { Student } from '../types'

export function parseStudents(data: string[][]): Student[] {
  return data.slice(1).map(row => {
    const rollNo = row[0]
    const name = row[1]
    const sgpa = parseFloat(row[row.length - 1]) || 0
    
    const subjects = []
    for (let i = 2; i < row.length - 1; i += 2) {
      if (row[i] && row[i + 1] !== undefined) {
        subjects.push({
          code: row[i],
          gp: parseInt(row[i + 1]) || 0
        })
      }
    }
    
    return { rollNo, name, subjects, sgpa }
  }).filter(s => s.rollNo && s.name)
}
