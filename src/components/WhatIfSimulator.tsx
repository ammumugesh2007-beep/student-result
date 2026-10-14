import React, { useState } from 'react';
import { Sliders, TrendingUp, ArrowRight, RotateCcw, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { StudentMetrics } from '../types';

interface Props {
  initialMetrics: StudentMetrics;
  baseProjectedScore: number;
  onClose: () => void;
  onApply: (updated: StudentMetrics) => void;
}

export const WhatIfSimulator: React.FC<Props> = ({
  initialMetrics,
  baseProjectedScore,
  onClose,
  onApply,
}) => {
  const [simStudyHours, setSimStudyHours] = useState(initialMetrics.studyHours);
  const [simAttendance, setSimAttendance] = useState(initialMetrics.attendance);
  const [simQuizScore, setSimQuizScore] = useState(initialMetrics.quizScore);

  // Dynamic calculation
  const calculateSimScore = () => {
    const quizWeight = 0.55;
    const attendanceWeight = 0.25;
    const studyWeight = 0.20;

    const normalizedStudy = Math.min(Math.max((simStudyHours / 12) * 100, 0), 100);
    const normalizedAttendance = Math.min(Math.max(simAttendance, 0), 100);
    const normalizedQuiz = Math.min(Math.max(simQuizScore, 0), 100);

    let baseline = (normalizedQuiz * quizWeight) + (normalizedAttendance * attendanceWeight) + (normalizedStudy * studyWeight);
    if (initialMetrics.recentTrend === 'improving') baseline += 3;
    if (initialMetrics.recentTrend === 'declining') baseline -= 4;

    return Math.min(Math.max(Math.round(baseline), 20), 100);
  };

  const simScore = calculateSimScore();
  const delta = simScore - baseProjectedScore;

  const handleReset = () => {
    setSimStudyHours(initialMetrics.studyHours);
    setSimAttendance(initialMetrics.attendance);
    setSimQuizScore(initialMetrics.quizScore);
  };

  const handleApplyChanges = () => {
    onApply({
      ...initialMetrics,
      studyHours: simStudyHours,
      attendance: simAttendance,
      quizScore: simQuizScore,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base">What-If Performance Simulator</h3>
              <p className="text-xs text-indigo-200/80">Explore how small habit changes boost your grade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Result Banner */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Baseline vs Simulated</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-bold text-slate-400 line-through">
                {baseProjectedScore}%
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="text-3xl font-black text-indigo-600 font-mono">
                {simScore}%
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              delta > 0
                ? 'bg-emerald-100 text-emerald-800'
                : delta < 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-200 text-slate-700'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {delta > 0 ? `+${delta}% Improvement` : delta < 0 ? `${delta}%` : 'No Change'}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {simScore >= 80 ? 'Low Risk trajectory' : simScore >= 70 ? 'Moderate Risk' : 'High Risk'}
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="p-5 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>Weekly Study Hours:</span>
              <span className="text-indigo-600 font-mono text-sm">{simStudyHours} hrs/week</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={simStudyHours}
              onChange={(e) => setSimStudyHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>Class Attendance Rate:</span>
              <span className="text-emerald-600 font-mono text-sm">{simAttendance}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={simAttendance}
              onChange={(e) => setSimAttendance(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>Next Quiz/Assignment Average:</span>
              <span className="text-amber-600 font-mono text-sm">{simQuizScore}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={simQuizScore}
              onChange={(e) => setSimQuizScore(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Apply to Metrics & Re-Run Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
