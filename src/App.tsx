import React, { useState, useEffect } from 'react';
import { Menu, GraduationCap, AlertTriangle } from 'lucide-react';
import { ActiveTab, ApiStatus, StudyMaterial, StudyTask, TutorStyle } from './types/index.ts';
import { DEFAULT_MATERIALS, DEFAULT_TASKS } from './data/defaultMaterials.ts';
import { geminiClient } from './services/geminiClient.ts';

// Components
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { StudyMaterialsView } from './components/StudyMaterialsView.tsx';
import { TutorView } from './components/TutorView.tsx';
import { QuizView } from './components/QuizView.tsx';
import { FlashcardsView } from './components/FlashcardsView.tsx';
import { StudyPlanView } from './components/StudyPlanView.tsx';
import { ProgressView } from './components/ProgressView.tsx';
import { ImportantQuestionsView } from './components/ImportantQuestionsView.tsx';
import { VivaView } from './components/VivaView.tsx';
import { SummarizerView } from './components/SummarizerView.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState<ApiStatus | null>(null);

  // Preferred Tutor Style setting
  const [tutorStyle, setTutorStyle] = useState<TutorStyle>('intuitive');

  // Study Materials state
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('studymate_materials');
      return saved ? JSON.parse(saved) : DEFAULT_MATERIALS;
    } catch {
      return DEFAULT_MATERIALS;
    }
  });

  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(materials[0] || null);

  // Today's Study Tasks state
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem('studymate_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  // Query passed from Dashboard search bar to AI Tutor
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string>('');

  // Overall student stats
  const [stats, setStats] = useState({
    hoursStudied: 4.5,
    quizAccuracy: 84,
    flashcardsMastered: 18,
    streakDays: 5,
    completedTopics: 7,
  });

  // Check Gemini API status on mount
  useEffect(() => {
    let isMounted = true;
    geminiClient.getStatus().then((s) => {
      if (isMounted) setStatus(s);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Save materials and tasks to local storage
  useEffect(() => {
    try {
      localStorage.setItem('studymate_materials', JSON.stringify(materials));
    } catch {}
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem('studymate_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTask: StudyTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleAddMaterial = (newMat: StudyMaterial) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    if (selectedMaterial?.id === id) {
      setSelectedMaterial(materials.find((m) => m.id !== id) || null);
    }
  };

  const handleAskTutorQuery = (query: string) => {
    setTutorInitialPrompt(query);
    setActiveTab('tutor');
  };

  const handleActionWithMaterial = (material: StudyMaterial, targetTab: ActiveTab) => {
    setSelectedMaterial(material);
    setActiveTab(targetTab);
  };

  const handleQuizCompleted = (score: number, total: number) => {
    const pct = Math.round((score / total) * 100);
    setStats((prev) => ({
      ...prev,
      quizAccuracy: Math.round((prev.quizAccuracy + pct) / 2),
      completedTopics: prev.completedTopics + 1,
    }));
  };

  const handleCardStatusChange = (known: number) => {
    setStats((prev) => ({
      ...prev,
      flashcardsMastered: prev.flashcardsMastered + known,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* 1. Left Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        status={status}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar (hidden on desktop) */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">StudyMate</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status?.ok ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] text-slate-500 capitalize">
              {activeTab.replace('_', ' ')}
            </span>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Missing API Key Guidance Banner (if applicable) */}
          {status && !status.hasEnvKey && (
            <div className="max-w-4xl mx-auto mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Configuration Required: </strong>
                  Please set your <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">GEMINI_API_KEY</code> environment variable in your <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> file or the AI Studio Secrets panel.
                </span>
              </div>
              <span className="text-[10px] text-amber-700/80 shrink-0 font-medium">
                gemini-3.8-flash
              </span>
            </div>
          )}

          {/* Active Tab Router */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onAskTutorQuery={handleAskTutorQuery}
              recentMaterials={materials}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onSelectMaterial={setSelectedMaterial}
              stats={stats}
            />
          )}

          {activeTab === 'materials' && (
            <StudyMaterialsView
              materials={materials}
              selectedMaterial={selectedMaterial}
              onSelectMaterial={setSelectedMaterial}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onActionWithMaterial={handleActionWithMaterial}
            />
          )}

          {activeTab === 'tutor' && (
            <TutorView
              initialPrompt={tutorInitialPrompt}
              onClearInitialPrompt={() => setTutorInitialPrompt('')}
              activeMaterial={selectedMaterial}
              allMaterials={materials}
              onSelectMaterial={setSelectedMaterial}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              activeMaterial={selectedMaterial}
              onQuizCompleted={handleQuizCompleted}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              activeMaterial={selectedMaterial}
              onCardStatusChange={handleCardStatusChange}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlanView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
            />
          )}

          {activeTab === 'progress' && <ProgressView stats={stats} />}

          {activeTab === 'important_questions' && (
            <ImportantQuestionsView activeMaterial={selectedMaterial} />
          )}

          {activeTab === 'viva' && (
            <VivaView activeMaterial={selectedMaterial} />
          )}

          {activeTab === 'summarizer' && (
            <SummarizerView
              currentTopic={selectedMaterial?.title || 'Data Structures'}
              currentNotes={selectedMaterial?.content || ''}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        status={status}
        selectedStyle={tutorStyle}
        onSelectStyle={setTutorStyle}
      />
    </div>
  );
}
