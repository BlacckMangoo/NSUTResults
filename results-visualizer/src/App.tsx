import { useState, useMemo } from 'react'
import type { View, Student, Semester } from './types'
import { useStudentData } from './hooks/useStudentData'
import { useBranchAnalytics } from './hooks/useBranchAnalytics'
import { useSubjectAnalytics } from './hooks/useSubjectAnalytics'
import { useStudentSearch } from './hooks/useStudentSearch'
import { getBranchCode } from './utils/helpers'
import { Header, Navigation } from './components/Layout'
import { StudentLookup } from './components/StudentLookup'
import { BranchView } from './components/BranchView'
import {
  OverallStatsCard,
  BranchComparison,
  SgpaDistributionChart,
  BranchStatsTable,
  DifficultSubjectsTable,
} from './components/AnalyticsComponents'
import {
  HighPerformersChart,
} from './components/AdvancedAnalytics'
import './App.css'

function App() {
  // State
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [view, setView] = useState<View>('lookup')
  const [selectedBranch, setSelectedBranch] = useState('UCS')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [semester, setSemester] = useState<Semester>('sem3')

  // Batch year based on semester
  const batchYearMap: Record<Semester, string> = {
    'sem1': '2025',
    'sem3': '2024', 
    'sem5': '2023',
    'sem7': '2022',
  }
  const batchYear = batchYearMap[semester]

  // Data hooks
  const { students, loading } = useStudentData(semester)
  const {
    batchStudents,
    branches,
    branchChartData,
    overallStats,
    sgpaDistribution,
  } = useBranchAnalytics(students, batchYear)
  const {
    subjectDifficulty,
    highPerformersStats,
  } = useSubjectAnalytics(batchStudents)

  // Student search
  const filteredStudents = useStudentSearch(students, search)

  // Branch view data
  const branchStudents = useMemo(() => {
    if (!selectedBranch) return []
    return batchStudents
      .filter(s => getBranchCode(s.rollNo) === selectedBranch)
      .sort((a, b) => b.sgpa - a.sgpa)
  }, [batchStudents, selectedBranch])

  const branchSubjects = useMemo(() => {
    if (branchStudents.length === 0) return []
    const subjectsSet = new Set<string>()
    branchStudents.forEach(s => {
      s.subjects.forEach(sub => subjectsSet.add(sub.code))
    })
    const allSubjects = Array.from(subjectsSet).sort()

    // Get only common subjects
    const subjectCounts = new Map<string, number>()
    allSubjects.forEach(subj => {
      const count = branchStudents.filter(s =>
        s.subjects.some(sub => sub.code === subj)
      ).length
      subjectCounts.set(subj, count)
    })

    return allSubjects.filter(
      subj => (subjectCounts.get(subj) || 0) >= branchStudents.length * 0.5
    )
  }, [branchStudents])

  const handleSelectStudent = (student: Student | null) => {
    setSelectedStudent(student)
    if (student) {
      setSearch(student.rollNo)
    }
    setShowSuggestions(false)
  }

  return (
    <div className="app">
      <Header studentCount={students.length} semester={semester} onSemesterChange={setSemester} />
      <Navigation view={view} onViewChange={setView} />

      {loading ? (
        <div className="loading">Loading results...</div>
      ) : view === 'lookup' ? (
        <StudentLookup
          filteredStudents={filteredStudents}
          search={search}
          selectedStudent={selectedStudent}
          showSuggestions={showSuggestions}
          onSearchChange={setSearch}
          onSelectStudent={handleSelectStudent}
          onShowSuggestions={setShowSuggestions}
        />
      ) : view === 'branch' ? (
        <BranchView
          branches={branches}
          selectedBranch={selectedBranch}
          branchStudents={branchStudents}
          branchSubjects={branchSubjects}
          onBranchChange={setSelectedBranch}
        />
      ) : (
        <div className="analytics">
          <div className="section-header">
            <h2>Performance Insights</h2>
            <p>Overall statistics across all branches ({batchYear} batch)</p>
          </div>

          <OverallStatsCard stats={overallStats} />
          <BranchComparison data={branchChartData} />
          <SgpaDistributionChart data={sgpaDistribution} />
          <BranchStatsTable data={branchChartData} />
          <DifficultSubjectsTable data={subjectDifficulty} />
          <HighPerformersChart data={highPerformersStats} />
        </div>
      )}
    </div>
  )
}

export default App
