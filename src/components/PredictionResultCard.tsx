import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Target,
  Share2,
  Printer,
  CheckCircle2,
  Circle,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { PredictionResult, StudentMetrics } from '../types';

interface Props {
  result: PredictionResult;
  metrics: StudentMetrics;
  onOpenAdvisorChat: () => void;
  onOpenWhatIf: () => void;
}

export const PredictionResultCard: React.FC<Props> = ({
  result,
  metrics,
  onOpenAdvisorChat,
  onOpenWhatIf,
}) => {
  const [copied, setCopied] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reset speech if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.formattedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Hello ${metrics.studentName || 'there'}! Here is your academic performance prediction. Your projected final score is ${result.projectedScore} percent, with a ${result.riskLevel} status. Here are your key strengths: ${result.strengths.join('. ')}. And here is your personalized action plan: ${result.actionPlan.join('. ')}. Keep up the dedication!`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low Risk':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          icon: ShieldCheck,
          bar: 'bg-emerald-500',
          subtext: 'Strong standing! Continue maintaining habits to secure top honors.',
        };
      case 'Moderate Risk':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          badge: 'bg-amber-500 text-white',
          icon: AlertTriangle,
          bar: 'bg-amber-500',
          subtext: 'Within reach of desired outcome, but needs focused adjustment in study or attendance.',
        };
      case 'High Risk':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          badge: 'bg-rose-600 text-white',
          icon: AlertTriangle,
          bar: 'bg-rose-500',
          subtext: 'Immediate intervention and consistent weekly support recommended to prevent falling behind.',
        };
    }
  };

  const riskStyle = getRiskColor(result.riskLevel);
  const RiskIcon = riskStyle.icon;

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = result.actionPlan.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* Top Banner & Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Advisor Prediction & Guidance</h3>
                {result.isSimulated && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Offline Baseline
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200/80">
                Prepared for {metrics.studentName || 'Student'} • {metrics.courseName || 'Course'}
              </p>
            </div>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSpeech}
              title={isSpeaking ? 'Stop voice reading' : 'Listen to Advisor Audio'}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy markdown report to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Print Student Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Big Score & Risk Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Projected Final Score */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
            <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
              <span className="font-semibold uppercase tracking-wider">Projected Final Score</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {result.projectedScore}%
              </span>
              <span className="text-xs text-indigo-200/90 font-medium">
                (Current quiz avg: {metrics.quizScore}%)
              </span>
            </div>

            {/* Score comparison progress bar */}
            <div className="mt-3 space-y-1">
              <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-700 ${riskStyle.bar}`}
                  style={{ width: `${result.projectedScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-indigo-200/70">
                <span>0%</span>
                <span>Pass: 70%</span>
                <span>Goal: {metrics.targetScore || 85}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200 block mb-1">
                Risk Classification
              </span>
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 ${riskStyle.badge}`}>
                  <RiskIcon className="w-4 h-4" />
                  {result.riskLevel}
                </span>
              </div>
            </div>
            <p className="text-xs text-indigo-200/90 mt-2 leading-relaxed">
              {riskStyle.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections: Exact Structured Output */}
      <div className="p-6 lg:p-7 space-y-6">
        {/* Section 1: Exact Performance Prediction Spec Box */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4.5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📊 Performance Prediction</span>
            </h4>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-md">
              AI Forecast
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-800 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>
                <strong>Projected Final Score:</strong>{' '}
                <span className="font-mono text-indigo-700 font-bold">{result.projectedScore}%</span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>
                <strong>Risk Level:</strong>{' '}
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${riskStyle.bg}`}>
                  {result.riskLevel}
                </span>
              </span>
            </li>
          </ul>
        </div>

        {/* Section 2: Strengths & Insights */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4.5">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
            <span>💡 Strengths & Insights</span>
          </h4>
          <ul className="space-y-2.5">
            {result.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800 leading-relaxed">
                <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Personalized Action Plan (Interactive Checklist) */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4.5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🚀 Personalized Action Plan</span>
            </h4>
            <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
              {completedCount} of {totalTasks} Completed
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Click tasks as you work through them to mark your weekly progress:
          </p>
          <div className="space-y-2.5">
            {result.actionPlan.map((action, idx) => {
              const isChecked = !!completedTasks[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-200 text-slate-600 line-through'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-indigo-300 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-indigo-600 focus:outline-none shrink-0"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                    )}
                  </button>
                  <span className="text-sm leading-relaxed">{action}</span>
                </div>
              );
            })}
          </div>

          {completedCount === totalTasks && totalTasks > 0 && (
            <div className="mt-3 p-2.5 bg-emerald-100/70 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span>Outstanding commitment! You completed all recommended action items this week!</span>
            </div>
          )}
        </div>

        {/* Warm Encouragement Quote */}
        {result.encouragementQuote && (
          <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-100 text-violet-900 text-xs italic flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
            <span>&ldquo;{result.encouragementQuote}&rdquo;</span>
          </div>
        )}

        {/* Action Buttons: Simulator & Advisor Chat */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onOpenWhatIf}
            className="flex-1 py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Simulate &ldquo;What-If&rdquo; Scenarios</span>
          </button>
          <button
            type="button"
            onClick={onOpenAdvisorChat}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>Ask Advisor Follow-Up Question</span>
          </button>
        </div>
      </div>
    </div>
  );
};
