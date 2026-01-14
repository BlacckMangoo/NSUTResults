export interface Subject {
  code: string
  gp: number
}

export interface Student {
  rollNo: string
  name: string
  subjects: Subject[]
  sgpa: number
}

export type View = 'lookup' | 'branch' | 'analytics'

export interface BranchStats {
  count: number
  sgpas: number[]
  avg: number
  median: number
  max: number
  min: number
}

export interface BranchChartData {
  name: string
  code: string
  avg: number
  median: number
  max: number
  min: number
  count: number
}

export interface SubjectDifficulty {
  code: string
  avgGP: number
  students: number
}

export interface TopPerformer {
  code: string
  name: string
  student: Student
}

export interface OverallStats {
  total: number
  avg: number
  median: number
  max: number
  min: number
}

export interface SgpaDistribution {
  range: string
  min: number
  max: number
  count: number
}

export interface SubjectStats {
  code: string
  avgGP: number
  count: number
}

export interface HighPerformerStats {
  name: string
  code: string
  high: number
  total: number
  percentage: number
}

export interface ConsistencyMetric {
  student: Student
  consistency: number
  variance: number
}
