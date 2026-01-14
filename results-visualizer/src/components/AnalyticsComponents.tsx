import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip
} from 'recharts'
import type { OverallStats, BranchChartData, SgpaDistribution, SubjectDifficulty, Student } from '../types'
import { getGradeColor, getGradeClass } from '../utils/helpers'
import '../styles/analytics.css'

interface OverallStatsCardProps {
  stats: OverallStats
}

export function OverallStatsCard({ stats }: OverallStatsCardProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Total Students</div>
        <div className="stat-value">{stats.total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Average SGPA</div>
        <div className="stat-value">{stats.avg.toFixed(2)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Median SGPA</div>
        <div className="stat-value">{stats.median.toFixed(2)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Highest SGPA</div>
        <div className="stat-value highlight">{stats.max.toFixed(2)}</div>
      </div>
    </div>
  )
}

interface BranchComparisonProps {
  data: BranchChartData[]
}

export function BranchComparison({ data }: BranchComparisonProps) {
  return (
    <div className="chart-card">
      <h3>Average SGPA by Branch</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
          <XAxis type="number" domain={[0, 10]} tick={{ fill: '#737373', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#e5e5e5', fontSize: 11 }} width={75} />
          <Tooltip 
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#e5e5e5' }}
            formatter={(value) => [(value as number).toFixed(2), 'Avg SGPA']}
          />
          <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGradeColor(entry.avg)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface SgpaDistributionProps {
  data: SgpaDistribution[]
}

export function SgpaDistributionChart({ data }: SgpaDistributionProps) {
  return (
    <div className="chart-card">
      <h3>SGPA Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
          <XAxis dataKey="range" tick={{ fill: '#737373', fontSize: 11 }} />
          <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff' }}
            itemStyle={{ color: '#ffffff' }}
            formatter={(value) => [value as number, 'Students']}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGradeColor(entry.min + 0.5)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BranchStatsTableProps {
  data: BranchChartData[]
}

export function BranchStatsTable({ data }: BranchStatsTableProps) {
  return (
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
            {data.map(branch => (
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
  )
}

interface DifficultSubjectsProps {
  data: SubjectDifficulty[]
}

export function DifficultSubjectsTable({ data }: DifficultSubjectsProps) {
  return (
    <div className="chart-card">
      <h3>Most Challenging Subjects</h3>
      <p className="chart-subtitle">Subjects ranked by average grade point (lower = harder)</p>
      <div className="table-wrapper">
        <table className="results-table analytics-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Subject Code</th>
              <th>Avg GP</th>
              <th>Students</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 15).map((subject, index) => (
              <tr key={subject.code}>
                <td className="rank">{index + 1}</td>
                <td className="name-cell">{subject.code}</td>
                <td className={getGradeClass(subject.avgGP)}>{subject.avgGP.toFixed(2)}</td>
                <td>{subject.students}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface ToppersCellProps {
  toppers: Array<{code: string; name: string; student: Student}>
}

export function ToppersCard({ toppers }: ToppersCellProps) {
  return (
    <div className="chart-card">
      <h3>Branch Toppers</h3>
      <div className="toppers-grid">
        {toppers.slice(0, 10).map(({ code, name, student }) => (
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
  )
}
