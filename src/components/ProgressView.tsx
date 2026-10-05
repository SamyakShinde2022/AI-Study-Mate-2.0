import React from 'react';
import {
  Clock,
  Award,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Brain,
  TrendingUp,
  Target,
} from 'lucide-react';

interface ProgressViewProps {
  stats: {
    hoursStudied: number;
    quizAccuracy: number;
    flashcardsMastered: number;
    streakDays: number;
    completedTopics: number;
  };
}

export const ProgressView: React.FC<ProgressViewProps> = ({ stats }) => {
  const weakTopics = [
    { name: 'Tree Traversals & Invariant Edge Cases', subject: 'Computer Science', risk: 'Medium' },
    { name: 'Non-Inertial Reference Frames', subject: 'Physics', risk: 'High' },
    { name: 'Transport Layer Congestion Mechanisms', subject: 'Computer Science', risk: 'Medium' },
  ];

  const masteredSubjects = [
    { name: 'Binary Search Trees & Search Logic', progress: 92 },
    { name: 'Newton’s Laws of Motion', progress: 85 },
    { name: 'OSI Reference Model Foundations', progress: 78 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Your Study Progress</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Key performance metrics, retention rate, and targeted review areas.
        </p>
      </div>

      {/* 4 Essential Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Study Time</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.hoursStudied} hrs</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">+1.5h from yesterday</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quiz Accuracy</span>
          </div>
          <div className="text-xl font-bold text-emerald-600">{stats.quizAccuracy}%</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across all quizzes</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Completed Topics</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.completedTopics}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Modules mastered</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Current Streak</span>
          </div>
          <div className="text-xl font-bold text-amber-600">{stats.streakDays} Days</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Consistent daily habit</span>
        </div>
      </div>

      {/* 2 Simple Visual Indicators (Topic Mastery & Weak Topics) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Topic Mastery Progress (7 cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Topic Retention Index</h3>
            <span className="text-[11px] text-slate-400">Based on quiz & flashcard drills</span>
          </div>

          <div className="space-y-4">
            {masteredSubjects.map((sub, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{sub.name}</span>
                  <span className="font-bold text-indigo-600">{sub.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${sub.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics List (5 cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Recommended Focus</h3>
            <span className="text-[11px] text-slate-400">Targeted review</span>
          </div>

          <div className="space-y-2.5">
            {weakTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{topic.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      topic.risk === 'High'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    {topic.risk} Priority
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">{topic.subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
