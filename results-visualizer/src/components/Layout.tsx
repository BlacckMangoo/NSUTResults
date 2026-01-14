import type { View } from '../types'
import '../styles/layout.css'

interface HeaderProps {
  studentCount: number
}

export function Header({ studentCount }: HeaderProps) {
  return (
    <header className="header">
      <a 
        href="https://github.com/BlacckMangoo/NSUTResults" 
        target="_blank" 
        rel="noopener noreferrer"
        className="github-star"
      >
        ⭐ Star on GitHub
      </a>
      <h1>NSUT Results</h1>
      <p>Semester 3 • 2025-26 • {studentCount} Students</p>
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
