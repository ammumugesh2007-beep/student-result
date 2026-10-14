import React, { useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, Plus, ArrowUpRight, CheckCircle2, Download, Search, Sparkles } from 'lucide-react';
import { StudentMetrics, PredictionResult } from '../types';

export interface RosterStudent extends StudentMetrics {
  id: string;
  prediction?: PredictionResult;
}

interface Props {
  students: RosterStudent[];
  onSelectStudent: (student: RosterStudent) => void;
  onAddStudent: (newStudent: RosterStudent) => void;
}

export const ClassRosterView: React.FC<Props> = ({
  students,
  onSelectStudent,
  onAddStudent,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New student state
  const [newStudent, setNewStudent] = useState<Partial<RosterStudent>>({
    studentName: '',
    courseName: 'General Academic',
    studyHours: 5,
    attendance: 85,
    quizScore: 75,
    recentTrend: 'steady',
    participation: 'medium',
    targetScore: 85,
  });

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterRisk === 'all') return true;
    return s.prediction?.riskLevel?.toLowerCase().includes(filterRisk.toLowerCase());
  });

  const lowRiskCount = students.filter((s) => s.prediction?.riskLevel === 'Low Risk').length;
  const modRiskCount = students.filter((s) => s.prediction?.riskLevel === 'Moderate Risk').length;
  const highRiskCount = students.filter((s) => s.prediction?.riskLevel === 'High Risk').length;
  const avgQuiz = Math.round(students.reduce((acc, s) => acc + s.quizScore, 0) / (students.length || 1));
  const avgProjected = Math.round(
    students.reduce((acc, s) => acc + (s.prediction?.projectedScore || s.quizScore), 0) / (students.length || 1)
  );

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.studentName?.trim()) return;

    const studentToAdd: RosterStudent = {
      id: `roster-${Date.now()}`,
      studentName: newStudent.studentName.trim(),
      courseName: newStudent.courseName || 'General Academic',
      studyHours: Number(newStudent.studyHours || 5),
      attendance: Number(newStudent.attendance || 85),
      quizScore: Number(newStudent.quizScore || 75),
      recentTrend: (newStudent.recentTrend as any) || 'steady',
      participation: (newStudent.participation as any) || 'medium',
      targetScore: Number(newStudent.targetScore || 85),
    };

    onAddStudent(studentToAdd);
    setShowAddModal(false);
    setNewStudent({
      studentName: '',
      courseName: 'General Academic',
      studyHours: 5,
      attendance: 85,
      quizScore: 75,
      recentTrend: 'steady',
      participation: 'medium',
      targetScore: 85,
    });
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'Course', 'Study Hours', 'Attendance (%)', 'Quiz Score (%)', 'Projected Score (%)', 'Risk Level'];
    const rows = students.map((s) => [
      `"${s.studentName}"`,
      `"${s.courseName}"`,
      s.studyHours,
      s.attendance,
      s.quizScore,
      s.prediction?.projectedScore || 'Pending',
      `"${s.prediction?.riskLevel || 'Pending'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Success_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Teacher & Advisor Roster</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track student cohorts, identify at-risk learners early, and initiate targeted intervention plans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Cohort Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Class Size</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{students.length}</span>
          <span className="text-[11px] text-slate-400">Total Enrolled</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">Low Risk</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{lowRiskCount}</span>
          <span className="text-[11px] text-emerald-600">On-Track</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Moderate Risk</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{modRiskCount}</span>
          <span className="text-[11px] text-amber-600">Needs Check-in</span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">High Risk</span>
          <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">{highRiskCount}</span>
          <span className="text-[11px] text-rose-600">Priority Support</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student or course..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {[
            { id: 'all', label: 'All Students' },
            { id: 'low', label: 'Low Risk' },
            { id: 'moderate', label: 'Moderate Risk' },
            { id: 'high', label: 'High Risk' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterRisk(pill.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterRisk === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-3">Weekly Study</th>
              <th className="py-3 px-3">Attendance</th>
              <th className="py-3 px-3">Quiz Avg</th>
              <th className="py-3 px-3">Projected Final</th>
              <th className="py-3 px-3">Risk Level</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => {
              const risk = student.prediction?.riskLevel || 'Pending';
              const projected = student.prediction?.projectedScore;

              let riskBadgeClass = 'bg-slate-100 text-slate-600';
              if (risk === 'Low Risk') riskBadgeClass = 'bg-emerald-100 text-emerald-800';
              if (risk === 'Moderate Risk') riskBadgeClass = 'bg-amber-100 text-amber-800';
              if (risk === 'High Risk') riskBadgeClass = 'bg-rose-100 text-rose-800';

              return (
                <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{student.studentName}</div>
                    <div className="text-[11px] text-slate-500">{student.courseName}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-700">
                    {student.studyHours}h/wk
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">
                    <span className={student.attendance >= 85 ? 'text-emerald-600' : 'text-amber-600'}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {student.quizScore}%
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-indigo-700">
                    {projected ? `${projected}%` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold inline-block ${riskBadgeClass}`}>
                      {risk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Analyze</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Student to Roster</h3>
            <p className="text-xs text-slate-500 mb-4">Enter current performance metrics to track in cohort.</p>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={newStudent.studentName}
                  onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                  placeholder="e.g. Daniel Vargas"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  value={newStudent.courseName}
                  onChange={(e) => setNewStudent({ ...newStudent, courseName: e.target.value })}
                  placeholder="e.g. Physics 101"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Study Hrs/Wk</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="0.5"
                    value={newStudent.studyHours}
                    onChange={(e) => setNewStudent({ ...newStudent, studyHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 text-xs text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Attendance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.attendance}
                    onChange={(e) => setNewStudent({ ...newStudent, attendance: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 text-xs text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quiz Score %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.quizScore}
                    onChange={(e) => setNewStudent({ ...newStudent, quizScore: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 text-xs text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
