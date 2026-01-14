import { useMemo } from 'react'
import type { Student, BranchStats, SgpaDistribution } from '../types'
import { getBranchCode, median } from '../utils/helpers'
import { BRANCH_CODE_MAP } from '../constants/branchMap'

export function useBranchAnalytics(students: Student[], batchYear: string = '2024') {
  // Filter to specified batch only
  const batchStudents = useMemo(() => {
    return students.filter(s => s.rollNo.startsWith(batchYear))
  }, [students, batchYear])

  // Get unique branches
  const branches = useMemo(() => {
    const codes = new Set<string>()
    batchStudents.forEach(s => {
      const code = getBranchCode(s.rollNo)
      if (code) codes.add(code)
    })
    return Array.from(codes).sort()
  }, [batchStudents])

  // Calculate branch stats
  const branchStats = useMemo(() => {
    const stats: Record<string, BranchStats> = {}
    
    batchStudents.forEach(s => {
      const code = getBranchCode(s.rollNo)
      if (!code) return
      
      if (!stats[code]) {
        stats[code] = { count: 0, sgpas: [], avg: 0, median: 0, max: 0, min: 10 }
      }
      stats[code].count++
      stats[code].sgpas.push(s.sgpa)
      stats[code].max = Math.max(stats[code].max, s.sgpa)
      stats[code].min = Math.min(stats[code].min, s.sgpa)
    })
    
    Object.keys(stats).forEach(code => {
      const sgpas = stats[code].sgpas
      stats[code].avg = sgpas.reduce((a, b) => a + b, 0) / sgpas.length
      stats[code].median = median(sgpas)
    })
    
    return stats
  }, [batchStudents])

  // Chart data for branch comparison
  const branchChartData = useMemo(() => {
    return Object.entries(branchStats)
      .map(([code, stat]) => ({
        name: BRANCH_CODE_MAP[code] || code,
        code,
        avg: stat.avg,
        median: stat.median,
        max: stat.max,
        min: stat.min,
        count: stat.count
      }))
      .sort((a, b) => b.avg - a.avg)
  }, [branchStats])

  // Overall statistics
  const overallStats = useMemo(() => {
    const sgpas = batchStudents.map(s => s.sgpa)
    if (sgpas.length === 0) return { avg: 0, median: 0, max: 0, min: 0, total: 0 }
    return {
      avg: sgpas.reduce((a, b) => a + b, 0) / sgpas.length,
      median: median(sgpas),
      max: Math.max(...sgpas),
      min: Math.min(...sgpas),
      total: sgpas.length
    }
  }, [batchStudents])

  // SGPA distribution buckets
  const sgpaDistribution = useMemo(() => {
    const buckets: SgpaDistribution[] = [
      { range: '9-10', min: 9, max: 10, count: 0 },
      { range: '8-9', min: 8, max: 9, count: 0 },
      { range: '7-8', min: 7, max: 8, count: 0 },
      { range: '6-7', min: 6, max: 7, count: 0 },
      { range: '5-6', min: 5, max: 6, count: 0 },
      { range: '4-5', min: 4, max: 5, count: 0 },
      { range: '<4', min: 0, max: 4, count: 0 },
    ]
    
    batchStudents.forEach(s => {
      const bucket = buckets.find(b => s.sgpa >= b.min && s.sgpa < b.max) || buckets[buckets.length - 1]
      if (s.sgpa === 10) buckets[0].count++
      else bucket.count++
    })
    
    return buckets
  }, [batchStudents])

  // Top performers per branch
  const topPerformers = useMemo(() => {
    const top: Record<string, Student> = {}
    batchStudents.forEach(s => {
      const code = getBranchCode(s.rollNo)
      if (!code) return
      if (!top[code] || s.sgpa > top[code].sgpa) {
        top[code] = s
      }
    })
    return Object.entries(top)
      .map(([code, student]) => ({ code, name: BRANCH_CODE_MAP[code] || code, student }))
      .sort((a, b) => b.student.sgpa - a.student.sgpa)
  }, [batchStudents])

  return {
    batchStudents,
    branches,
    branchStats,
    branchChartData,
    overallStats,
    sgpaDistribution,
    topPerformers
  }
}
