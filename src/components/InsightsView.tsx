import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Zap,
  Target,
  ArrowUpRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { StudyInsightsResult } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface InsightsViewProps {
  currentSubject: string;
  quizzesTaken: number;
  avgQuizScore: number;
  flashcardsMastered: number;
  flashcardsNeedingReview: number;
  vivaScore: number;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  currentSubject,
  quizzesTaken,
  avgQuizScore,
  flashcardsMastered,
  flashcardsNeedingReview,
  vivaScore,
}) => {
  const [subject, setSubject] = useState(currentSubject || 'Computer Science');
  const [examName, setExamName] = useState('Upcoming Final Examination');

  // Interactive metrics (pre-filled from live app session, but student can tune them)
  const [quizzes, setQuizzes] = useState(quizzesTaken || 3);
  const [quizAvg, setQuizAvg] = useState(avgQuizScore || 78);
  const [masteredCards, setMasteredCards] = useState(flashcardsMastered || 14);
  const [reviewCards, setReviewCards] = useState(flashcardsNeedingReview || 6);
  const [viva, setViva] = useState(vivaScore || 7.5);
  const [hours, setHours] = useState(12.5);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<StudyInsightsResult | null>(null);

  React.useEffect(() => {
    if (currentSubject && (!subject || subject === 'Computer Science')) {
      setSubject(currentSubject);
    }
  }, [currentSubject]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await geminiClient.generateStudyInsights({
        subject,
        targetExamName: examName,
        stats: {
          quizzesTaken: quizzes,
          averageQuizScore: quizAvg,
          flashcardsMastered: masteredCards,
          flashcardsNeedingReview: reviewCards,
          vivaAverageScore: viva,
          hoursStudied: hours,
        },
        weakTopics: ['Edge cases & negative weights', 'Time complexity derivations'],
        strongTopics: ['Core definitions', 'Basic greedy properties'],
      });
      setInsights(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate study insights.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Tuning & Context Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white">AI Study Insights & Gap Diagnosis</h2>
            </div>
            <p className="text-xs text-slate-400">
              Gemini evaluates your study retention, testing cadence, and cognitive weak points
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] uppercase">Quizzes Completed</span>
              <strong className="text-white font-bold">{quizzes} tests ({quizAvg}%)</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] uppercase">Flashcard Retention</span>
              <strong className="text-emerald-400 font-bold">{masteredCards} Mastered</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] uppercase">Viva Voce Rating</span>
              <strong className="text-indigo-400 font-bold">{viva} / 10</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px] uppercase">Logged Hours</span>
              <strong className="text-amber-400 font-bold">{hours}h Deep Work</strong>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Patterns...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{insights ? 'Re-Analyze Insights' : 'Generate AI Insights'}</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <strong>Error: </strong> {error}
          </div>
        )}
      </div>

      {/* Main Insights Panel */}
      {insights ? (
        <div className="space-y-6">
          {/* Readiness Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Score Wheel / Gauge (4 cols) */}
            <div className="md:col-span-4 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                Exam Readiness Index
              </span>

              <div className="relative my-2 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center">
                  <div
                    className="w-full h-full rounded-full border-8 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
                    style={{
                      clipPath: `inset(0 0 0 0)`,
                    }}
                  >
                    <div className="text-center">
                      <span className="text-3xl font-extrabold text-white tracking-tight">
                        {insights.readinessScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        {insights.readinessLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2">
                Evaluated against target benchmark for <strong>{subject}</strong>.
              </p>
            </div>

            {/* Cognitive Retention Diagnosis (8 cols) */}
            <div className="md:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Cognitive Retention & Memory Decay Analysis
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {insights.cognitiveRetentionDiagnosis}
                </p>
              </div>

              {/* Motivational booster */}
              {insights.motivationalInsight && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Neuro-Learning Advice: </strong>
                    {insights.motivationalInsight}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strengths & Critical Weaknesses Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top Strengths */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Solidified Mastery Areas
              </h3>
              <div className="space-y-2">
                {insights.topStrengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Weaknesses & Actionable Remedy */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Vulnerabilities & Targeted Remedies
              </h3>
              <div className="space-y-2.5">
                {insights.criticalWeaknesses.map((weak, idx) => {
                  const riskColor =
                    weak.riskLevel === 'Severe'
                      ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                      : 'bg-amber-950 text-amber-300 border-amber-500/40';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">{weak.topic}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${riskColor}`}>
                          {weak.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-slate-300">
                        <strong className="text-indigo-300">Remedy: </strong>
                        {weak.recommendedRemedy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Prioritized Action Plan */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Target className="w-4 h-4" /> Prioritized 24-Hour Study Action Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.prioritizedActionPlan.map((action, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-indigo-400">
                      Phase {idx + 1}
                    </span>
                  </div>
                  <p className="text-slate-100 font-medium leading-relaxed pt-1">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-slate-700">
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Data-Driven Academic Analytics
          </h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400 mb-6">
            Synthesize your quiz scores, flashcard recall rates, and viva results into an overall Readiness Score, retention diagnosis, and 24-hour improvement plan.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Generate AI Study Insights for {subject}
          </button>
        </div>
      )}
    </div>
  );
};
