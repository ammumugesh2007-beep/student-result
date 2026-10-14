import React, { useState } from 'react';
import { BookOpen, Clock, CalendarCheck, Award, Sparkles, ChevronDown, ChevronUp, User, Bookmark } from 'lucide-react';
import { StudentMetrics } from '../types';
import { SAMPLE_STUDENTS } from '../data/sampleStudents';

interface Props {
  metrics: StudentMetrics;
  onChange: (updated: StudentMetrics) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const StudentInputForm: React.FC<Props> = ({
  metrics,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSliderChange = (field: keyof StudentMetrics, value: number) => {
    onChange({
      ...metrics,
      [field]: value,
    });
  };

  const handleInputChange = (field: keyof StudentMetrics, value: any) => {
    onChange({
      ...metrics,
      [field]: value,
    });
  };

  const loadPreset = (preset: typeof SAMPLE_STUDENTS[0]) => {
    onChange({
      studentName: preset.studentName,
      courseName: preset.courseName,
      studyHours: preset.studyHours,
      attendance: preset.attendance,
      quizScore: preset.quizScore,
      assignmentScore: preset.assignmentScore,
      recentTrend: preset.recentTrend,
      participation: preset.participation,
      targetScore: preset.targetScore,
      notes: preset.notes,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 lg:p-7 space-y-6">
      {/* Header & Quick Presets */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Student Metrics</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Predictive AI Input
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Enter weekly study hours, attendance rate, and current quiz scores to forecast performance and receive personalized guidance.
        </p>

        {/* Quick Presets Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
            <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Quick Profile:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_STUDENTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadPreset(sample)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left font-medium ${
                  metrics.studentName === sample.studentName
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title={sample.description}
              >
                {sample.studentName} <span className="opacity-60 text-[11px]">({sample.quizScore}% quiz, {sample.studyHours}h)</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Name and Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Student Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={metrics.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject / Course
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={metrics.courseName}
                onChange={(e) => handleInputChange('courseName', e.target.value)}
                placeholder="e.g. AP Biology, Algebra II"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Metric 1: Weekly Study Hours */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-800">Weekly Study Hours</label>
                <p className="text-xs text-slate-500">Dedicated self-study & revision time outside class</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="40"
                step="0.5"
                value={metrics.studyHours}
                onChange={(e) => handleInputChange('studyHours', Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-16 px-2.5 py-1 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-xs font-medium text-slate-500">hrs/wk</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="0.5"
            value={metrics.studyHours}
            onChange={(e) => handleSliderChange('studyHours', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>0 hrs</span>
            <span>5 hrs</span>
            <span>10 hrs</span>
            <span>15 hrs</span>
            <span>20+ hrs</span>
          </div>
        </div>

        {/* Metric 2: Class Attendance */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-800">Class Attendance Rate</label>
                <p className="text-xs text-slate-500">Percentage of lecture & lab sessions attended</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={metrics.attendance}
                onChange={(e) => handleInputChange('attendance', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 px-2.5 py-1 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-xs font-medium text-slate-500">%</span>
            </div>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            value={metrics.attendance}
            onChange={(e) => handleSliderChange('attendance', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>50% (Low)</span>
            <span>75% (Acceptable)</span>
            <span>90%+ (Optimal)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Metric 3: Current Quiz / Test Scores */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-800">Current Quiz / Assessment Average</label>
                <p className="text-xs text-slate-500">Average score across quizzes, tests & assignments so far</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={metrics.quizScore}
                onChange={(e) => handleInputChange('quizScore', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 px-2.5 py-1 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-xs font-medium text-slate-500">%</span>
            </div>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            value={metrics.quizScore}
            onChange={(e) => handleSliderChange('quizScore', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>&lt;60% (F)</span>
            <span>70% (C)</span>
            <span>80% (B)</span>
            <span>90%+ (A)</span>
          </div>
        </div>

        {/* Expandable Advanced Options */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1 transition-colors"
          >
            <span>Additional Context (Target Goal, Trend, Notes)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Score Goal (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={metrics.targetScore || 85}
                    onChange={(e) => handleInputChange('targetScore', parseInt(e.target.value) || 85)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Recent Trajectory / Trend</label>
                  <select
                    value={metrics.recentTrend}
                    onChange={(e) => handleInputChange('recentTrend', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="improving">Improving (scores rising recently)</option>
                    <option value="steady">Steady / Consistent</option>
                    <option value="declining">Declining (recent dip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specific Learning Challenges or Teacher Notes
                </label>
                <textarea
                  value={metrics.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                  placeholder="e.g. Struggles with time management on exams, participates actively in group discussions..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Academic Metrics with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Predict Performance & Generate Advisor Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
