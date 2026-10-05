import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  HelpCircle,
  Layers,
  FileQuestion,
  Mic,
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { ActiveTab, ApiStatus } from '../types/index.ts';
import { SAMPLE_TOPICS, SampleTopic } from '../data/sampleTopics.ts';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  status: ApiStatus | null;
  onSelectSampleTopic: (sample: SampleTopic) => void;
  selectedTopicName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  status,
  onSelectSampleTopic,
  selectedTopicName,
}) => {
  const [topicDropdownOpen, setTopicDropdownOpen] = React.useState(false);

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'tutor', label: 'AI Tutor', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'summarizer', label: 'Summarizer', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz Generator', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'important_questions', label: 'High-Yield Qs', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'viva', label: 'Viva Voce', icon: <Mic className="w-4 h-4" />, badge: 'Oral' },
    { id: 'planner', label: 'Study Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-4 h-4" />, badge: 'Analytics' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  CogniStudy <span className="text-indigo-400 font-extrabold text-sm uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
                </h1>
                <span className="hidden md:inline-flex items-center text-xs font-medium text-slate-400 border border-slate-700/60 rounded-full px-2 py-0.5 bg-slate-800/60">
                  Powered by Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                All-in-One Academic Intelligence & Exam Mastery Suite
              </p>
            </div>
          </div>

          {/* Quick Preset Selector & Status */}
          <div className="flex items-center gap-3">
            {/* Presets dropdown */}
            <div className="relative">
              <button
                onClick={() => setTopicDropdownOpen(!topicDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition shadow-sm"
                title="Load sample academic topic"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate max-w-[130px] sm:max-w-[170px]">
                  Topic: {selectedTopicName || 'Choose Sample'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {topicDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setTopicDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-left">
                    <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Preset Academic Subjects
                    </div>
                    <div className="space-y-1">
                      {SAMPLE_TOPICS.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            onSelectSampleTopic(st);
                            setTopicDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-indigo-600/20 hover:text-indigo-200 text-slate-300 transition flex flex-col group border border-transparent hover:border-indigo-500/30"
                        >
                          <span className="font-semibold text-white group-hover:text-indigo-300">
                            {st.name}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {st.subject} • {st.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Server & API Key Health Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                status?.ok
                  ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                  : status?.hasEnvKey === false
                  ? 'bg-amber-950/50 border-amber-500/30 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title={
                status?.ok
                  ? `Connected to Gemini API (${status.model})`
                  : status?.hasEnvKey === false
                  ? 'GEMINI_API_KEY environment variable required'
                  : 'Checking Gemini status...'
              }
            >
              {status?.ok ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="hidden sm:inline">Gemini Online</span>
                  <span className="sm:hidden">Online</span>
                </>
              ) : status?.hasEnvKey === false ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Pending</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>Connecting</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-800/80 text-indigo-100'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
