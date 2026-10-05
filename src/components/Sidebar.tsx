import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Layers,
  Calendar,
  BarChart2,
  Settings,
  Sparkles,
  X,
  FileQuestion,
  Mic,
  GraduationCap,
} from 'lucide-react';
import { ActiveTab, ApiStatus } from '../types/index.ts';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  status: ApiStatus | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  status,
  mobileOpen,
  onCloseMobile,
  onOpenSettings,
}) => {
  const primaryNavItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'materials', label: 'Study Materials', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'planner', label: 'Study Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const secondaryNavItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'important_questions', label: 'High-Yield Qs', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'viva', label: 'Viva Voce Exam', icon: <Mic className="w-4 h-4" /> },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    onTabChange(tabId);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between bg-white text-slate-800">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                StudyMate <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">AI</span>
              </span>
              <p className="text-[11px] text-slate-400">Intelligent Study Platform</p>
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Study Space
          </div>
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Exam Prep Tools
          </div>
          {secondaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Settings / Status */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={() => {
            onOpenSettings();
            onCloseMobile();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer ${
            activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-semibold' : ''
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        {/* Gemini Service Status indicator */}
        <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status?.ok ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-600 font-medium truncate max-w-[120px]">
              Gemini 3.8 Flash
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {status?.ok ? 'Ready' : 'Setup'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white shrink-0 sticky top-0 h-screen z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
