import type { Student } from '../types'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { getGradeColor, getGradeClass } from '../utils/helpers'
import '../styles/lookup.css'

interface StudentLookupProps {
  filteredStudents: Student[]
  search: string
  selectedStudent: Student | null
  showSuggestions: boolean
  onSearchChange: (value: string) => void
  onSelectStudent: (student: Student | null) => void
  onShowSuggestions: (show: boolean) => void
}

export function StudentLookup({
  filteredStudents,
  search,
  selectedStudent,
  showSuggestions,
  onSearchChange,
  onSelectStudent,
  onShowSuggestions
}: StudentLookupProps) {
  const chartData = selectedStudent?.subjects.map(s => ({
    name: s.code,
    gp: s.gp
  })) || []

  return (
    <>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Type roll number (e.g. 2024UCS1234) or name..."
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            onShowSuggestions(true)
            if (!e.target.value.trim()) {
              onSelectStudent(null)
            }
          }}
          onFocus={() => onShowSuggestions(true)}
          onBlur={() => setTimeout(() => onShowSuggestions(false), 200)}
        />
        {showSuggestions && filteredStudents.length > 0 && (
          <div className="suggestions">
            {filteredStudents.map(student => (
              <div
                key={student.rollNo}
                className="suggestion-item"
                onClick={() => onSelectStudent(student)}
              >
                <div className="suggestion-roll">{student.rollNo}</div>
                <div className="suggestion-name">{student.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent ? (
        <>
          <div className="student-card">
            <div className="card-header">
              <div>
                <div className="card-name">{selectedStudent.name}</div>
                <div className="card-roll">{selectedStudent.rollNo}</div>
              </div>
              <div className={`sgpa-badge ${getGradeClass(selectedStudent.sgpa)}`}>
                {selectedStudent.sgpa.toFixed(2)}
              </div>
            </div>
            <div className="subjects-grid">
              {selectedStudent.subjects.map(sub => (
                <div key={sub.code} className="subject-item">
                  <div className="subject-code">{sub.code}</div>
                  <div className={`subject-gp ${getGradeClass(sub.gp)}`}>{sub.gp}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Subject Grades</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ left: 0, right: 20, top: 10, bottom: 30 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#737373', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
  )
}
