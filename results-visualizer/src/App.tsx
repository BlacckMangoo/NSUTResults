import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import './App.css'

const BRANCH_CODE_MAP: Record<string, string> = {
  "UME": "Mechanical",
  "UCM": "MAC",
  "UEA": "ECAM",
  "UCA": "CSAI",
  "UEV": "VLSI",
  "UIT": "IT",
  "UCS": "CSE",
  "UEE": "Electrical",
  "UEC": "ECE",
  "UIC": "ICE",
  "UCD": "CSDS",
  "UCB": "CSDA",
  "UIN": "ITNS",
  "UBT": "Biotech",
  "UGI": "Geoinformatics",
  "UCI": "CSIOT",
  "UMV": "MEEV",
  "UCE":"Civil"
}

function getBranchCode(rollNo: string): string {
  const match = rollNo.match(/\d{4}([A-Z]{2,3})\d+/)
  return match?.[1] || ''
}

function getBranchFromRoll(rollNo: string): string {
  const code = getBranchCode(rollNo)
  return BRANCH_CODE_MAP[code] || code || 'Unknown'
}

interface Student {
  rollNo: string
  name: string
  subjects: { code: string; gp: number }[]
  sgpa: number
}

function parseStudents(data: string[][]): Student[] {
  return data.slice(1).map(row => {
    const rollNo = row[0]
    const name = row[1]
    const sgpa = parseFloat(row[row.length - 1]) || 0
    
    const subjects: { code: string; gp: number }[] = []
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

function getGradeClass(gp: number): string {
  if (gp >= 9) return 'grade-9'
  if (gp >= 8) return 'grade-8'
  if (gp >= 7) return 'grade-7'
  if (gp >= 6) return 'grade-6'
  if (gp >= 5) return 'grade-5'
  if (gp >= 4) return 'grade-4'
  return 'grade-low'
}

function getGradeColor(gp: number): string {
  if (gp >= 9) return '#22c55e'
  if (gp >= 8) return '#84cc16'
  if (gp >= 7) return '#84cc16'
  if (gp >= 6) return '#eab308'
  if (gp >= 5) return '#f97316'
  if (gp >= 4) return '#ef4444'
  return '#ef4444'
}

type View = 'lookup' | 'branch' | 'analytics'

// Helper to calculate median
function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function App() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [view, setView] = useState<View>('lookup')
  const [selectedBranch, setSelectedBranch] = useState('UCS')

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

  // Get unique branches
  const branches = useMemo(() => {
    const codes = new Set<string>()
    students.forEach(s => {
      const code = getBranchCode(s.rollNo)
      if (code) codes.add(code)
    })
    return Array.from(codes).sort()
  }, [students])

  // Filter students by branch (only 2024 batch for consistent subjects)
  const branchStudents = useMemo(() => {
    if (!selectedBranch) return []
    return students
      .filter(s => s.rollNo.startsWith('2024') && getBranchCode(s.rollNo) === selectedBranch)
      .sort((a, b) => b.sgpa - a.sgpa)
  }, [students, selectedBranch])

  // Get only subjects common to ALL students in the branch
  const branchSubjects = useMemo(() => {
    if (branchStudents.length === 0) return []
    
    // Start with subjects of first student
    let commonSubjects = new Set(branchStudents[0].subjects.map(s => s.code))
    
    // Intersect with each subsequent student's subjects
    branchStudents.forEach(student => {
      const studentSubjects = new Set(student.subjects.map(s => s.code))
      commonSubjects = new Set([...commonSubjects].filter(sub => studentSubjects.has(sub)))
    })
    
    return Array.from(commonSubjects).sort()
  }, [branchStudents])

  // Analytics: Only 2024 batch students
  const batch2024Students = useMemo(() => {
    return students.filter(s => s.rollNo.startsWith('2024'))
  }, [students])

  // Branch-wise statistics
  const branchStats = useMemo(() => {
    const stats: Record<string, { count: number; sgpas: number[]; avg: number; median: number; max: number; min: number }> = {}
    
    batch2024Students.forEach(s => {
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
    
    // Calculate avg and median
    Object.keys(stats).forEach(code => {
      const sgpas = stats[code].sgpas
      stats[code].avg = sgpas.reduce((a, b) => a + b, 0) / sgpas.length
      stats[code].median = median(sgpas)
    })
    
    return stats
  }, [batch2024Students])

  // Chart data for branch comparison
  const branchChartData = useMemo(() => {
    return Object.entries(branchStats)
      .map(([code, stat]) => ({
        name: BRANCH_CODE_MAP[code] || code,
        code,
        avg: parseFloat(stat.avg.toFixed(2)),
        median: parseFloat(stat.median.toFixed(2)),
        max: stat.max,
        min: stat.min,
        count: stat.count
      }))
      .sort((a, b) => b.avg - a.avg)
  }, [branchStats])

  // SGPA distribution (histogram buckets)
  const sgpaDistribution = useMemo(() => {
    const buckets = [
      { range: '9-10', min: 9, max: 10, count: 0 },
      { range: '8-9', min: 8, max: 9, count: 0 },
      { range: '7-8', min: 7, max: 8, count: 0 },
      { range: '6-7', min: 6, max: 7, count: 0 },
      { range: '5-6', min: 5, max: 6, count: 0 },
      { range: '4-5', min: 4, max: 5, count: 0 },
      { range: '<4', min: 0, max: 4, count: 0 },
    ]
    
    batch2024Students.forEach(s => {
      const bucket = buckets.find(b => s.sgpa >= b.min && s.sgpa < b.max) || buckets[buckets.length - 1]
      if (s.sgpa === 10) buckets[0].count++
      else bucket.count++
    })
    
    return buckets
  }, [batch2024Students])

  // Overall stats
  const overallStats = useMemo(() => {
    const sgpas = batch2024Students.map(s => s.sgpa)
    if (sgpas.length === 0) return { avg: 0, median: 0, max: 0, min: 0, total: 0 }
    return {
      avg: sgpas.reduce((a, b) => a + b, 0) / sgpas.length,
      median: median(sgpas),
      max: Math.max(...sgpas),
      min: Math.min(...sgpas),
      total: sgpas.length
    }
  }, [batch2024Students])

  // Top performers per branch
  const topPerformers = useMemo(() => {
    const top: Record<string, Student> = {}
    batch2024Students.forEach(s => {
      const code = getBranchCode(s.rollNo)
      if (!code) return
      if (!top[code] || s.sgpa > top[code].sgpa) {
        top[code] = s
      }
    })
    return Object.entries(top)
      .map(([code, student]) => ({ code, name: BRANCH_CODE_MAP[code] || code, student }))
      .sort((a, b) => b.student.sgpa - a.student.sgpa)
  }, [batch2024Students])

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return []
    const query = search.toLowerCase()
    return students
      .filter(s => 
        s.rollNo.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query)
      )
      .slice(0, 10)
  }, [students, search])

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setSearch(student.rollNo)
    setShowSuggestions(false)
  }

  const chartData = selectedStudent?.subjects.map(s => ({
    name: s.code,
    gp: s.gp
  })) || []

  // Get grade for a student and subject
  const getSubjectGrade = (student: Student, subjectCode: string): number | null => {
    const subject = student.subjects.find(s => s.code === subjectCode)
    return subject ? subject.gp : null
  }

  return (
    <div className="app">
      <header className="header">
        <h1>NSUT Results</h1>
        <p>Semester 3 • 2025-26 • {students.length} Students</p>
      </header>

      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={`tab ${view === 'lookup' ? 'active' : ''}`}
          onClick={() => setView('lookup')}
        >
          Find Student
        </button>
        <button 
          className={`tab ${view === 'branch' ? 'active' : ''}`}
          onClick={() => setView('branch')}
        >
          Rankings
        </button>
        <button 
          className={`tab ${view === 'analytics' ? 'active' : ''}`}
          onClick={() => setView('analytics')}
        >
          Insights
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading results...</div>
      ) : view === 'lookup' ? (
        <>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Type roll number (e.g. 2024UCS1234) or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowSuggestions(true)
                if (!e.target.value.trim()) {
                  setSelectedStudent(null)
                }
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            
            {showSuggestions && filteredStudents.length > 0 && (
              <div className="suggestions">
                {filteredStudents.map(student => (
                  <div
                    key={student.rollNo}
                    className="suggestion-item"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="name">{student.name}</div>
                    <div className="roll">{student.rollNo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStudent ? (
            <>
              <div className="student-card">
                <div className="student-header">
                  <div className="student-info">
                    <h2>{selectedStudent.name}</h2>
                    <div className="roll-no">{selectedStudent.rollNo}</div>
                    <div className="branch">{getBranchFromRoll(selectedStudent.rollNo)}</div>
                  </div>
                  <div className="sgpa-badge">
                    <div className="label">SGPA</div>
                    <div className="value">{selectedStudent.sgpa.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="subjects-grid">
                  {selectedStudent.subjects.map((subject, idx) => (
                    <div key={idx} className="subject-item">
                      <div className="code">{subject.code}</div>
                      <div className={`grade ${getGradeClass(subject.gp)}`}>
                        {subject.gp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-container">
                <h3>Grade Points by Subject</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#737373', fontSize: 10 }}
                      axisLine={{ stroke: '#222222' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      tick={{ fill: '#737373', fontSize: 10 }}
                      axisLine={{ stroke: '#222222' }}
                      tickLine={false}
                    />
                    <Bar dataKey="gp" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getGradeColor(entry.gp)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>Find Your Result</h3>
              <p>Start typing your roll number or name above</p>
            </div>
          )}
        </>
      ) : view === 'branch' ? (
        /* Branch View */
        <>
          <div className="section-header">
            <h2>Branch Rankings</h2>
            <p>Students ranked by SGPA within each branch</p>
          </div>
          <div className="branch-selector">
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="branch-select"
            >
              <option value="">Choose a branch...</option>
              {branches.map(code => (
                <option key={code} value={code}>
                  {BRANCH_CODE_MAP[code] || code}
                </option>
              ))}
            </select>
            {selectedBranch && (
              <span className="student-count">{branchStudents.length} students</span>
            )}
          </div>

          {selectedBranch && branchStudents.length > 0 ? (
            <div className="table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th className="sticky-col">Rank</th>
                    <th className="sticky-col-2">Name</th>
                    <th className="sticky-col-3">Roll No</th>
                    {branchSubjects.map(sub => (
                      <th key={sub}>{sub}</th>
                    ))}
                    <th className="sgpa-col">SGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {branchStudents.map((student, idx) => (
                    <tr key={student.rollNo}>
                      <td className="sticky-col rank">{idx + 1}</td>
                      <td className="sticky-col-2 name-cell">{student.name}</td>
                      <td className="sticky-col-3 roll-cell">{student.rollNo}</td>
                      {branchSubjects.map(sub => {
                        const gp = getSubjectGrade(student, sub)
                        return (
                          <td key={sub} className={gp !== null ? getGradeClass(gp) : 'no-grade'}>
                            {gp !== null ? gp : '-'}
                          </td>
                        )
                      })}
                      <td className="sgpa-col">{student.sgpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedBranch ? (
            <div className="empty-state">
              <p>No 2024 batch students found in this branch</p>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Select Your Branch</h3>
              <p>Choose from the dropdown above to see rankings</p>
            </div>
          )}
        </>
      ) : (
        /* Analytics View */
        <div className="analytics">
          <div className="section-header">
            <h2>Performance Insights</h2>
            <p>Overall statistics across all branches (2024 batch)</p>
          </div>
          {/* Overall Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Students</div>
              <div className="stat-value">{overallStats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average SGPA</div>
              <div className="stat-value">{overallStats.avg.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Median SGPA</div>
              <div className="stat-value">{overallStats.median.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Highest SGPA</div>
              <div className="stat-value highlight">{overallStats.max.toFixed(2)}</div>
            </div>
          </div>

          {/* Branch-wise Average SGPA Chart */}
          <div className="chart-card">
            <h3>Average SGPA by Branch</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchChartData} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" domain={[0, 10]} tick={{ fill: '#737373', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#e5e5e5', fontSize: 11 }} width={75} />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e5e5' }}
                  formatter={(value) => [(value as number).toFixed(2), 'Avg SGPA']}
                />
                <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                  {branchChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getGradeColor(entry.avg)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SGPA Distribution */}
          <div className="chart-card">
            <h3>SGPA Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sgpaDistribution} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                <XAxis dataKey="range" tick={{ fill: '#737373', fontSize: 11 }} />
                <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e5e5' }}
                  formatter={(value) => [value as number, 'Students']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {sgpaDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getGradeColor(entry.min + 0.5)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Statistics Table */}
          <div className="chart-card">
            <h3>Branch-wise Statistics</h3>
            <div className="table-wrapper">
              <table className="results-table analytics-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Students</th>
                    <th>Avg SGPA</th>
                    <th>Median</th>
                    <th>Max</th>
                    <th>Min</th>
                  </tr>
                </thead>
                <tbody>
                  {branchChartData.map(branch => (
                    <tr key={branch.code}>
                      <td className="name-cell">{branch.name}</td>
                      <td>{branch.count}</td>
                      <td className={getGradeClass(branch.avg)}>{branch.avg.toFixed(2)}</td>
                      <td>{branch.median.toFixed(2)}</td>
                      <td className="grade-9">{branch.max.toFixed(2)}</td>
                      <td className={getGradeClass(branch.min)}>{branch.min.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performers */}
          <div className="chart-card">
            <h3>Branch Toppers</h3>
            <div className="toppers-grid">
              {topPerformers.slice(0, 10).map(({ code, name, student }) => (
                <div key={code} className="topper-card">
                  <div className="topper-branch">{name}</div>
                  <div className="topper-name">{student.name}</div>
                  <div className="topper-roll">{student.rollNo}</div>
                  <div className={`topper-sgpa ${getGradeClass(student.sgpa)}`}>
                    {student.sgpa.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
