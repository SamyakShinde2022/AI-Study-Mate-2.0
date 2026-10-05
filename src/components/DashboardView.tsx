import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Award,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { StudyMaterial, StudyTask } from '../types/index.ts';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onAskTutorQuery: (query: string) => void;
  recentMaterials: StudyMaterial[];
  tasks: StudyTask[];
  onToggleTask: (taskId: string) => void;
  onSelectMaterial: (material: StudyMaterial) => void;
  stats: {
    hoursStudied: number;
    quizAccuracy: number;
    flashcardsMastered: number;
    streakDays: number;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onAskTutorQuery,
  recentMaterials,
  tasks,
  onToggleTask,
  onSelectMaterial,
  stats,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onAskTutorQuery(searchQuery.trim());
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* 1. Header Greeting & Prominent Search */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {greeting} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            What would you like to study today?
          </p>
        </div>

        {/* ONE Prominent AI Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask StudyMate anything... (e.g. Explain recursion in simple words, What is Newton's second law?)"
              className="w-full bg-white border border-slate-200/90 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Ask</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean sample prompt hints */}
          <div className="flex items-center gap-2 mt-2 px-1 text-xs text-slate-500 overflow-x-auto scrollbar-none">
            <span className="text-slate-400 shrink-0">Try asking:</span>
            <button
              type="button"
              onClick={() => onAskTutorQuery('Explain recursion in simple words')}
              className="text-slate-600 hover:text-indigo-600 hover:underline shrink-0"
            >
              "Explain recursion in simple words"
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onAskTutorQuery('What are Newton’s three laws of motion?')}
              className="text-slate-600 hover:text-indigo-600 hover:underline shrink-0"
            >
              "Newton’s three laws"
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onAskTutorQuery('Explain the difference between TCP and UDP')}
              className="text-slate-600 hover:text-indigo-600 hover:underline shrink-0"
            >
              "TCP vs UDP"
            </button>
          </div>
        </form>
      </div>

      {/* 2. Continue Learning (2-3 Recent Subjects) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Continue Learning
          </h2>
          <button
            onClick={() => onNavigate('materials')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all materials →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentMaterials.slice(0, 3).map((material) => (
            <div
              key={material.id}
              onClick={() => {
                onSelectMaterial(material);
                onNavigate('materials');
              }}
              className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-xl p-4 shadow-xs hover:shadow-sm transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {material.subject}
                </span>
                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition line-clamp-2">
                  {material.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {material.readingMinutes}m read
                </span>
                <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition">
                  Resume →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Today's Study Plan & Progress (Two columns on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Today's Tasks (7 cols) */}
        <section className="md:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Today's Study Plan</h2>
              <p className="text-xs text-slate-500">
                {completedTasksCount} of {tasks.length} tasks completed
              </p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Open Planner →
            </button>
          </div>

          {/* Simple Task Checklist */}
          <div className="space-y-2 pt-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition cursor-pointer ${
                  task.completed
                    ? 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                    : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="text-indigo-600 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>
                  <span
                    className={`font-medium ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400">{task.duration}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      task.priority === 'high'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Your Progress (5 cols) */}
        <section className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Your Progress</h2>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Details →
            </button>
          </div>

          {/* Simple Clean Indicators */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">
                Study Time
              </span>
              <span className="text-lg font-bold text-slate-900">
                {stats.hoursStudied}h
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">
                Quiz Accuracy
              </span>
              <span className="text-lg font-bold text-emerald-600">
                {stats.quizAccuracy}%
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">
                Mastered Cards
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {stats.flashcardsMastered}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">
                Study Streak
              </span>
              <span className="text-lg font-bold text-amber-600 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                {stats.streakDays}d
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            Keep it up! Consistent 30-min active recall sessions double long-term retention.
          </div>
        </section>
      </div>

      {/* 4. Compact AI Study Insight Section */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">AI Study Insight</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
              Daily Diagnostic
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your retention in <strong>Data Structures</strong> is strong (88%). To maximize exam readiness, schedule 15 minutes of spaced practice on <strong>OSI transport protocols</strong> before tonight.
          </p>
        </div>
        <button
          onClick={() => onNavigate('progress')}
          className="text-xs text-slate-400 hover:text-slate-600 shrink-0 font-medium"
        >
          View all insights →
        </button>
      </section>
    </div>
  );
};
