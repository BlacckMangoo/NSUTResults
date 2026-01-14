import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { Student } from '../types'
import { getGradeClass, getBranchFromRoll } from '../utils/helpers'
import '../styles/analytics.css'

interface HighPerformersProps {
  data: Array<{name: string; code: string; above75Pct: number; above85Pct: number; total: number}>
}

export function HighPerformersChart({ data }: HighPerformersProps) {
  return (
    <div className="chart-card">
      <h3>High Performers by Branch</h3>
      <p className="chart-subtitle">Percentage of students with SGPA above thresholds</p>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={data} layout="vertical" margin={{ left: 100, right: 30, top: 10, bottom: 10 }}>
          <XAxis type="number" domain={[0, 60]} tick={{ fill: '#737373', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#e5e5e5', fontSize: 11 }} width={95} />
          <Tooltip 
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value) => [(value as number).toFixed(1) + '%']}
          />
          <Legend wrapperStyle={{ color: '#e5e5e5', fontSize: 12 }} />
          <Bar dataKey="above75Pct" name="SGPA > 7.5" radius={[0, 4, 4, 0]} fill="#84cc16" />
          <Bar dataKey="above85Pct" name="SGPA ≥ 8.5" radius={[0, 4, 4, 0]} fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PopularSubjectsProps {
  data: Array<{code: string; count: number}>
}

export function PopularSubjectsChart({ data }: PopularSubjectsProps) {
  return (
    <div className="chart-card">
      <h3>Most Popular Subjects</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ left: 0, right: 20, top: 10, bottom: 50 }}>
          <XAxis 
            dataKey="code" 
            tick={{ fill: '#737373', fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value) => [value as number, 'Students']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PerfectScorersProps {
  students: Student[]
}

export function PerfectScorersCard({ students }: PerfectScorersProps) {
  if (students.length === 0) return null

  return (
    <div className="chart-card">
      <h3>Perfect Scorers</h3>
      <p className="chart-subtitle">Students with GP ≥ 9 in all subjects</p>
      <div className="toppers-grid">
        {students.map(student => (
          <div key={student.rollNo} className="topper-card highlight-card">
            <div className="topper-branch">{getBranchFromRoll(student.rollNo)}</div>
            <div className="topper-name">{student.name}</div>
            <div className="topper-roll">{student.rollNo}</div>
            <div className="topper-sgpa grade-9">
              {student.sgpa.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SuccessRateProps {
  data: Array<{code: string; passed: number; total: number; rate: number}>
}

export function SubjectSuccessRateTable({ data }: SuccessRateProps) {
  return (
    <div className="chart-card">
      <h3>Subject Success Rate</h3>
      <p className="chart-subtitle">Percentage of students scoring ≥ 6 (GP threshold)</p>
      <div className="table-wrapper">
        <table className="results-table analytics-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Subject Code</th>
              <th>Success Rate</th>
              <th>Passed</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 15).map((subject, index) => (
              <tr key={subject.code}>
                <td className="rank">{index + 1}</td>
                <td className="name-cell">{subject.code}</td>
                <td className={subject.rate >= 80 ? 'grade-9' : subject.rate >= 60 ? 'grade-7' : 'grade-low'}>
                  {subject.rate.toFixed(1)}%
                </td>
                <td>{subject.passed}</td>
                <td>{subject.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface ConsistencyProps {
  data: Array<{student: Student; consistency: number; variance: number}>
}

export function ConsistencyTable({ data }: ConsistencyProps) {
  return (
    <div className="chart-card">
      <h3>Most Consistent Performers</h3>
      <p className="chart-subtitle">Students with stable grades across subjects</p>
      <div className="table-wrapper">
        <table className="results-table analytics-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Roll No</th>
              <th>SGPA</th>
              <th>Consistency Score</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 15).map((metric, index) => (
              <tr key={metric.student.rollNo}>
                <td className="rank">{index + 1}</td>
                <td className="name-cell">{metric.student.name}</td>
                <td>{metric.student.rollNo}</td>
                <td className={getGradeClass(metric.student.sgpa)}>{metric.student.sgpa.toFixed(2)}</td>
                <td className={getGradeClass(metric.consistency)}>{metric.consistency.toFixed(2)}/10</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
