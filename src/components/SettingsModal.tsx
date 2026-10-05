import React from 'react';
import {
  Settings,
  Check,
  Sparkles,
  ShieldCheck,
  X,
  HelpCircle,
} from 'lucide-react';
import { ApiStatus, TutorStyle } from '../types/index.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ApiStatus | null;
  selectedStyle: TutorStyle;
  onSelectStyle: (style: TutorStyle) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  selectedStyle,
  onSelectStyle,
}) => {
  if (!isOpen) return null;

  const styles: Array<{ id: TutorStyle; name: string; desc: string }> = [
    {
      id: 'intuitive',
      name: 'Intuitive & Visual',
      desc: 'Relatable everyday analogies and visual explanations before technical jargon.',
    },
    {
      id: 'first-principles',
      name: 'First Principles',
      desc: 'Deconstructs concepts down to fundamental axioms and builds upward step-by-step.',
    },
    {
      id: 'exam-focused',
      name: 'Exam Focused',
      desc: 'Standard textbook definitions, formula derivations, and marking criteria keywords.',
    },
    {
      id: 'socratic',
      name: 'Socratic Dialogue',
      desc: 'Thought-provoking questions and hints to guide you toward independent discovery.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-xs text-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">StudyMate Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Tutor Style */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-900 block">
            Preferred Explanation Style
          </label>
          <div className="space-y-1.5">
            {styles.map((s) => {
              const isSelected = selectedStyle === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectStyle(s.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-500/20 text-indigo-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="font-semibold block text-slate-900">{s.name}</span>
                    <span className="text-[11px] text-slate-500">{s.desc}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Model & Architecture Status */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
          <span className="font-semibold text-slate-900 block">AI Integration Architecture</span>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Active Model:</span>
            <span className="font-mono font-semibold text-slate-800">gemini-3.8-flash</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">API Connection:</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                status?.ok ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.ok ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {status?.ok ? 'Online (Connected)' : 'API Key Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Security:</span>
            <span className="text-slate-700 font-medium">Server-side proxy routes only</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
