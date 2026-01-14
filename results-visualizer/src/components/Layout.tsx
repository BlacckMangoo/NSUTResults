import type { View, Semester } from '../types'
import '../styles/layout.css'

const SEMESTER_INFO: Record<Semester, { label: string; batch: string }> = {
  'sem1': { label: 'Sem 1', batch: '2025' },
  'sem3': { label: 'Sem 3', batch: '2024' },
  'sem5': { label: 'Sem 5', batch: '2023' },
  'sem7': { label: 'Sem 7', batch: '2022' },
}

interface HeaderProps {
  studentCount: number
  semester: Semester
  onSemesterChange: (semester: Semester) => void
}

export function Header({ studentCount, semester, onSemesterChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>NSUT Results</h1>
        <span className="student-count">{studentCount} Students</span>
      </div>
      <div className="header-right">
        <div className="semester-selector">
          {(Object.keys(SEMESTER_INFO) as Semester[]).map((sem) => (
            <button
              key={sem}
              className={`semester-btn ${semester === sem ? 'active' : ''}`}
              onClick={() => onSemesterChange(sem)}
            >
              <span className="sem-label">{SEMESTER_INFO[sem].label}</span>
              <span className="sem-batch">{SEMESTER_INFO[sem].batch}</span>
            </button>
          ))}
        </div>
        <a 
          href="https://github.com/BlacckMangoo/NSUTResults" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-star"
        >
          ⭐ Star
        </a>
      </div>
    </header>
  )
}

interface NavigationProps {
  view: View
  onViewChange: (view: View) => void
}

export function Navigation({ view, onViewChange }: NavigationProps) {
  return (
    <div className="tabs">
      <button 
        className={`tab ${view === 'lookup' ? 'active' : ''}`}
        onClick={() => onViewChange('lookup')}
      >
        Find Student
      </button>
      <button 
        className={`tab ${view === 'branch' ? 'active' : ''}`}
        onClick={() => onViewChange('branch')}
      >
        Rankings
      </button>
      <button 
        className={`tab ${view === 'analytics' ? 'active' : ''}`}
        onClick={() => onViewChange('analytics')}
      >
        Insights
      </button>
    </div>
  )
}
