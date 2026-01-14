import { BRANCH_CODE_MAP } from '../constants/branchMap'

export function getBranchCode(rollNo: string): string {
  const match = rollNo.match(/\d{4}([A-Z]{2,3})\d+/)
  return match?.[1] || ''
}

export function getBranchFromRoll(rollNo: string): string {
  const code = getBranchCode(rollNo)
  return BRANCH_CODE_MAP[code] || code || 'Unknown'
}

export function getGradeClass(gp: number): string {
  if (gp >= 9) return 'grade-9'
  if (gp >= 8) return 'grade-8'
  if (gp >= 7) return 'grade-7'
  if (gp >= 6) return 'grade-6'
  if (gp >= 5) return 'grade-5'
  if (gp >= 4) return 'grade-4'
  return 'grade-low'
}

export function getGradeColor(gp: number): string {
  if (gp >= 9) return '#22c55e'
  if (gp >= 8) return '#84cc16'
  if (gp >= 7) return '#84cc16'
  if (gp >= 6) return '#eab308'
  if (gp >= 5) return '#f97316'
  if (gp >= 4) return '#ef4444'
  return '#ef4444'
}

export function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
