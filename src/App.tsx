import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
  BookOpen,
  Info,
  CheckCircle,
  Clock,
  CalendarCheck,
  Award,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { StudentMetrics, PredictionResult } from './types';
import { SAMPLE_STUDENTS } from './data/sampleStudents';
import { StudentInputForm } from './components/StudentInputForm';
import { PredictionResultCard } from './components/PredictionResultCard';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AdvisorChatModal } from './components/AdvisorChatModal';
import { ClassRosterView, RosterStudent } from './components/ClassRosterView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'advisor' | 'roster' | 'guide'>('advisor');

  // Active student metrics
  const [currentMetrics, setCurrentMetrics] = useState<StudentMetrics>({
    studentName: 'Alex Rivera',
    courseName: 'AP Biology',
    studyHours: 4,
    attendance: 88,
    quizScore: 72,
    assignmentScore: 80,
    recentTrend: 'steady',
    participation: 'medium',
    targetScore: 85,
    notes: 'Understands classroom concepts, but misses key details on timed weekly quizzes.',
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showAdvisorChat, setShowAdvisorChat] = useState(false);

  // Roster state with initial sample students
  const [roster, setRoster] = useState<RosterStudent[]>([
    {
      id: 'r-1',
      studentName: 'Alex Rivera',
      courseName: 'AP Biology',
      studyHours: 4,
      attendance: 88,
      quizScore: 72,
      recentTrend: 'steady',
      participation: 'medium',
      targetScore: 85,
      prediction: {
        projectedScore: 76,
        riskLevel: 'Moderate Risk',
        strengths: ['Solid 88% class attendance', 'Engaged in lab sessions'],
        actionPlan: [
          'Increase study time from 4 to 6.5 hours weekly focusing on active recall.',
          'Review incorrect quiz answers within 24 hours of receiving grades.',
        ],
        formattedMarkdown: `### 📊 Performance Prediction\n* **Projected Final Score:** 76%\n* **Risk Level:** Moderate Risk\n\n### 💡 Strengths & Insights\n* Solid 88% class attendance, showing regular engagement in class concepts.\n* Reliable assignment submissions that demonstrate foundational comprehension.\n\n### 🚀 Personalized Action Plan\n* Increase study time from 4 to 6.5 hours weekly by setting aside two 45-minute active recall blocks.\n* Create a quick 1-page summary sheet after each lecture to reinforce vocabulary before Friday quizzes.`,
      },
    },
    {
      id: 'r-2',
      studentName: 'Maya Lin',
      courseName: 'Calculus I',
      studyHours: 11,
      attendance: 98,
      quizScore: 91,
      recentTrend: 'improving',
      participation: 'high',
      targetScore: 95,
      prediction: {
        projectedScore: 93,
        riskLevel: 'Low Risk',
        strengths: ['Superb attendance at 98%', 'Exemplary 11 hrs/wk self-study habit'],
        actionPlan: [
          'Maintain current study cadence while attempting higher-difficulty challenge problems.',
          'Consider peer-tutoring fellow classmates to further cement conceptual mastery.',
        ],
        formattedMarkdown: `### 📊 Performance Prediction\n* **Projected Final Score:** 93%\n* **Risk Level:** Low Risk\n\n### 💡 Strengths & Insights\n* Outstanding attendance (98%) paired with disciplined weekly study habits (11 hours).\n* Strong analytical foundation reflected in a 91% quiz average.\n\n### 🚀 Personalized Action Plan\n* Maintain your regular study rhythm while rotating in timed practice exams.\n* Focus on explaining complex proofs aloud to deepen retention for the final exam.`,
      },
    },
    {
      id: 'r-3',
      studentName: 'Jordan Patel',
      courseName: 'World History',
      studyHours: 6,
      attendance: 70,
      quizScore: 68,
      recentTrend: 'declining',
      participation: 'low',
      targetScore: 80,
      prediction: {
        projectedScore: 69,
        riskLevel: 'High Risk',
        strengths: ['Decent independent study time (6 hrs/wk)'],
        actionPlan: [
          'Target attendance above 85% to catch discussion themes that appear on tests.',
          'Meet with the instructor during office hours to clarify missing concepts.',
        ],
        formattedMarkdown: `### 📊 Performance Prediction\n* **Projected Final Score:** 69%\n* **Risk Level:** High Risk\n\n### 💡 Strengths & Insights\n* You already commit 6 hours per week to studying, proving your willingness to put in the work.\n\n### 🚀 Personalized Action Plan\n* Prioritize attending all weekly lectures; missing key class sessions directly impacts quiz performance.\n* Reach out to the teacher after class to clarify any topics missed during absences.`,
      },
    },
    {
      id: 'r-4',
      studentName: 'Chloe Bennett',
      courseName: 'Chemistry 101',
      studyHours: 8,
      attendance: 90,
      quizScore: 82,
      recentTrend: 'improving',
      participation: 'high',
      targetScore: 90,
      prediction: {
        projectedScore: 85,
        riskLevel: 'Low Risk',
        strengths: ['Positive upward trajectory in quizzes', 'Consistent 90% attendance'],
        actionPlan: [
          'Target challenging equilibrium problem sets during mid-week study sessions.',
          'Form a regular review group before unit exams.',
        ],
        formattedMarkdown: `### 📊 Performance Prediction\n* **Projected Final Score:** 85%\n* **Risk Level:** Low Risk\n\n### 💡 Strengths & Insights\n* Consistent attendance (90%) and positive upward momentum on recent assessments.\n* Active class participation that correlates with stronger quiz retention.\n\n### 🚀 Personalized Action Plan\n* Dedicate 30 minutes of each study session to working through unassisted practice problems.\n* Keep up the upward momentum by reviewing weekly problem sets before moving to new units.`,
      },
    },
  ]);

  // Initial calculation on load
  useEffect(() => {
    handleRunPrediction(currentMetrics, false);
  }, []);

  const handleRunPrediction = async (metricsToRun: StudentMetrics, updateRoster = true) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricsToRun),
      });

      const data: PredictionResult = await response.json();
      setPrediction(data);

      if (updateRoster) {
        // Update student in roster if exists, or append
        setRoster((prev) => {
          const index = prev.findIndex(
            (s) => s.studentName.toLowerCase() === metricsToRun.studentName.toLowerCase()
          );
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              ...metricsToRun,
              prediction: data,
            };
            return updated;
          }
          return [
            ...prev,
            {
              id: `r-${Date.now()}`,
              ...metricsToRun,
              prediction: data,
            },
          ];
        });
      }
    } catch (err) {
      console.error('Failed to run prediction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromRoster = (student: RosterStudent) => {
    setCurrentMetrics({
      studentName: student.studentName,
      courseName: student.courseName,
      studyHours: student.studyHours,
      attendance: student.attendance,
      quizScore: student.quizScore,
      assignmentScore: student.assignmentScore,
      recentTrend: student.recentTrend,
      participation: student.participation,
      targetScore: student.targetScore,
      notes: student.notes,
    });
    if (student.prediction) {
      setPrediction(student.prediction);
    } else {
      handleRunPrediction(student, true);
    }
    setActiveTab('advisor');
  };

  const handleAddStudentToRoster = (newStudent: RosterStudent) => {
    setRoster((prev) => [newStudent, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  Student Success Predictor
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Advisor AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Predictive performance analytics & personalized coaching
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'advisor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Predictor</span>
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Class Roster</span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                {roster.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Methodology</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: PREDICTOR & ADVISOR */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            {/* Context Notice / Tip */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-white text-indigo-600 shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dual Perspective: Designed for Students & Instructors
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Forecast final course outcomes, detect risk levels early, and obtain compassionate, direct action steps.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200/60 shrink-0">
                <span>Model: Gemini 3.8 Flash</span>
              </div>
            </div>

            {/* Two Column Layout: Input Form & Result Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Input Form (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <StudentInputForm
                  metrics={currentMetrics}
                  onChange={setCurrentMetrics}
                  onSubmit={() => handleRunPrediction(currentMetrics, true)}
                  isLoading={isLoading}
                />
              </div>

              {/* Right Column: Prediction Output Card (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {prediction ? (
                  <PredictionResultCard
                    result={prediction}
                    metrics={currentMetrics}
                    onOpenAdvisorChat={() => setShowAdvisorChat(true)}
                    onOpenWhatIf={() => setShowWhatIf(true)}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Ready to Predict Student Success</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Adjust weekly study hours, class attendance, and quiz average on the left, then click
                      &quot;Predict Performance&quot; to receive your structured evaluation.
                    </p>
                    <button
                      onClick={() => handleRunPrediction(currentMetrics, true)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Analyze Current Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS ROSTER (TEACHER VIEW) */}
        {activeTab === 'roster' && (
          <ClassRosterView
            students={roster}
            onSelectStudent={handleSelectFromRoster}
            onAddStudent={handleAddStudentToRoster}
          />
        )}

        {/* TAB 3: METHODOLOGY & ADVISING PRINCIPLES */}
        {activeTab === 'guide' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Educational Framework</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                How Academic Success is Predicted & Advised
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                The Student Success Predictor blends statistical learning indicators with empathetic generative advising. It focuses on the three highest-leverage variables identified in modern educational research:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Weekly Study Hours</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Studies show that distributed practice (spacing study across 4-5 sessions of 45-60 mins) yields 2.5x higher retention than cramming.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Class Attendance</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students maintaining 85%+ attendance are statistically 73% less likely to fail course exams due to real-time teacher feedback.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Continuous Quizzes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Frequent low-stakes testing exercises active recall, preventing the illusion of competence and highlighting gaps early.
                </p>
              </div>
            </div>

            {/* Structured Report Guide */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">The Advisor Response Standard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every AI evaluation strictly follows the 3-pillar advisory format:
              </p>
              <div className="font-mono text-xs bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 overflow-x-auto">
                <div className="text-indigo-300 font-bold">### 📊 Performance Prediction</div>
                <div>* <strong>Projected Final Score:</strong> [Calculated estimation, e.g. 82%]</div>
                <div>* <strong>Risk Level:</strong> [Low Risk / Moderate Risk / High Risk]</div>
                <div className="text-emerald-300 font-bold mt-2">### 💡 Strengths & Insights</div>
                <div>* 1-2 positive patterns based on their current data</div>
                <div className="text-amber-300 font-bold mt-2">### 🚀 Personalized Action Plan</div>
                <div>* 2-3 specific, realistic bullet points on how the student can improve or maintain their grade</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Simulator Modal */}
      {showWhatIf && prediction && (
        <WhatIfSimulator
          initialMetrics={currentMetrics}
          baseProjectedScore={prediction.projectedScore}
          onClose={() => setShowWhatIf(false)}
          onApply={(updated) => {
            setCurrentMetrics(updated);
            handleRunPrediction(updated, true);
          }}
        />
      )}

      {/* Advisor Chat Modal */}
      {showAdvisorChat && prediction && (
        <AdvisorChatModal
          metrics={currentMetrics}
          prediction={prediction}
          onClose={() => setShowAdvisorChat(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">Student Success Predictor & Advisor AI</span>
          </div>
          <div>
            Built to empower students and educators with encouraging, evidence-based academic growth.
          </div>
        </div>
      </footer>
    </div>
  );
}
