import type { Student } from '../types'
import { getGradeClass } from '../utils/helpers'
import { BRANCH_CODE_MAP } from '../constants/branchMap'
import '../styles/branch.css'

interface BranchViewProps {
  branches: string[]
  selectedBranch: string
  branchStudents: Student[]
  branchSubjects: string[]
  onBranchChange: (branch: string) => void
}

export function BranchView({
  branches,
  selectedBranch,
  branchStudents,
  branchSubjects,
  onBranchChange
}: BranchViewProps) {
  return (
    <>
      <div className="section-header">
        <h2>Branch Rankings</h2>
        <p>Students ranked by SGPA within each branch</p>
      </div>

      <div className="branch-selector">
        <select 
          value={selectedBranch} 
          onChange={(e) => onBranchChange(e.target.value)}
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
                {branchSubjects.map(subj => (
                  <th key={subj}>{subj}</th>
                ))}
                <th>SGPA</th>
              </tr>
            </thead>
            <tbody>
              {branchStudents.map((student, index) => (
                <tr key={student.rollNo}>
                  <td className="sticky-col rank">{index + 1}</td>
                  <td className="sticky-col-2 name-cell">{student.name}</td>
                  <td className="sticky-col-3 roll-cell">{student.rollNo}</td>
                  {branchSubjects.map(subj => {
                    const subject = student.subjects.find(s => s.code === subj)
                    return (
                      <td key={`${student.rollNo}-${subj}`} className={subject ? getGradeClass(subject.gp) : 'no-grade'}>
                        {subject ? subject.gp : '-'}
                      </td>
                    )
                  })}
                  <td className={`sgpa-col ${getGradeClass(student.sgpa)}`}>
                    {student.sgpa.toFixed(2)}
                  </td>
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
  )
}
