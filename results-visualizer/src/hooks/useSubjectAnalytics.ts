import { useMemo } from 'react'
import type { Student } from '../types'
import { getBranchCode } from '../utils/helpers'
import { BRANCH_CODE_MAP } from '../constants/branchMap'

export function useSubjectAnalytics(batch2024Students: Student[]) {
  // Most difficult subjects (lowest average grade point)
  const subjectDifficulty = useMemo(() => {
    const subjectStats: Record<string, { total: number; count: number }> = {}
    
    batch2024Students.forEach(s => {
      s.subjects.forEach(sub => {
        if (!subjectStats[sub.code]) {
          subjectStats[sub.code] = { total: 0, count: 0 }
        }
        subjectStats[sub.code].total += sub.gp
        subjectStats[sub.code].count++
      })
    })
    
    return Object.entries(subjectStats)
      .map(([code, { total, count }]) => ({
        code,
        avgGP: total / count,
        students: count
      }))
      .filter(s => s.students >= 50)
      .sort((a, b) => a.avgGP - b.avgGP)
  }, [batch2024Students])

  // Subject success rate (% of students with GP >= 6)
  const subjectSuccessRate = useMemo(() => {
    const stats: Record<string, { passed: number; total: number; rate: number }> = {}
    
    batch2024Students.forEach(s => {
      s.subjects.forEach(sub => {
        if (!stats[sub.code]) stats[sub.code] = { passed: 0, total: 0, rate: 0 }
        stats[sub.code].total++
        if (sub.gp >= 6) stats[sub.code].passed++
      })
    })
    
    Object.keys(stats).forEach(code => {
      stats[code].rate = (stats[code].passed / stats[code].total) * 100
    })
    
    return Object.entries(stats)
      .map(([code, data]) => ({
        code,
        ...data,
        rate: parseFloat(data.rate.toFixed(1))
      }))
      .filter(s => s.total >= 50)
      .sort((a, b) => a.rate - b.rate)
  }, [batch2024Students])

  // Most popular subjects
  const subjectPopularity = useMemo(() => {
    const popularity: Record<string, number> = {}
    
    batch2024Students.forEach(s => {
      s.subjects.forEach(sub => {
        popularity[sub.code] = (popularity[sub.code] || 0) + 1
      })
    })
    
    return Object.entries(popularity)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [batch2024Students])

  // High performers (SGPA > 7.5 and >= 8.5) percentage by branch
  const highPerformersStats = useMemo(() => {
    const stats: Record<string, { above75: number; above85: number; total: number }> = {}
    
    batch2024Students.forEach(s => {
      const code = getBranchCode(s.rollNo)
      if (!code) return
      if (!stats[code]) stats[code] = { above75: 0, above85: 0, total: 0 }
      stats[code].total++
      if (s.sgpa > 7.5) stats[code].above75++
      if (s.sgpa >= 8.5) stats[code].above85++
    })
    
    return Object.entries(stats)
      .map(([code, data]) => ({
        name: BRANCH_CODE_MAP[code] || code,
        code,
        above75Pct: parseFloat(((data.above75 / data.total) * 100).toFixed(1)),
        above85Pct: parseFloat(((data.above85 / data.total) * 100).toFixed(1)),
        total: data.total
      }))
      .sort((a, b) => b.above85Pct - a.above85Pct)
  }, [batch2024Students])

  // Perfect scorers (GP >= 9 in all subjects)
  const perfectScorers = useMemo(() => {
    return batch2024Students.filter(s => 
      s.subjects.every(sub => sub.gp >= 9)
    ).sort((a, b) => b.sgpa - a.sgpa)
  }, [batch2024Students])

  // Consistency metric (low variance in grades)
  const consistencyMetrics = useMemo(() => {
    return batch2024Students.map(s => {
      const gps = s.subjects.map(sub => sub.gp)
      const variance = gps.length === 0 ? 0 : 
        gps.reduce((sum, gp) => sum + Math.pow(gp - s.sgpa, 2), 0) / gps.length
      const stdDev = Math.sqrt(variance)
      
      return {
        student: s,
        consistency: 10 - stdDev,
        variance: stdDev
      }
    }).sort((a, b) => b.consistency - a.consistency)
  }, [batch2024Students])

  return {
    subjectDifficulty,
    subjectSuccessRate,
    subjectPopularity,
    highPerformersStats,
    perfectScorers,
    consistencyMetrics
  }
}
