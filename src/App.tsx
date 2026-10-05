import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab, ApiStatus } from './types/index.ts';
import { SAMPLE_TOPICS, SampleTopic } from './data/sampleTopics.ts';
import { geminiClient } from './services/geminiClient.ts';
import { Header } from './components/Header.tsx';
import { TutorView } from './components/TutorView.tsx';
import { SummarizerView } from './components/SummarizerView.tsx';
import { QuizView } from './components/QuizView.tsx';
import { FlashcardsView } from './components/FlashcardsView.tsx';
import { ImportantQuestionsView } from './components/ImportantQuestionsView.tsx';
import { VivaView } from './components/VivaView.tsx';
import { StudyPlanView } from './components/StudyPlanView.tsx';
import { InsightsView } from './components/InsightsView.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutor');
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SampleTopic>(SAMPLE_TOPICS[0]);

  // Cross-feature study performance metrics
  const [quizzesTaken, setQuizzesTaken] = useState(2);
  const [avgQuizScore, setAvgQuizScore] = useState(80);
  const [flashcardsMastered, setFlashcardsMastered] = useState(12);
  const [flashcardsNeedingReview, setFlashcardsNeedingReview] = useState(4);
  const [vivaScore, setVivaScore] = useState(8.2);

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

  const handleSelectSampleTopic = (topic: SampleTopic) => {
    setSelectedTopic(topic);
  };

  const handleQuizCompleted = (score: number, total: number) => {
    const pct = Math.round((score / total) * 100);
    setQuizzesTaken((prev) => prev + 1);
    setAvgQuizScore((prev) => Math.round((prev + pct) / 2));
  };

  const handleCardStatusChange = (mastered: number, needsReview: number) => {
    setFlashcardsMastered(mastered);
    setFlashcardsNeedingReview(needsReview);
  };

  const handleVivaEvaluated = (score: number) => {
    setVivaScore(score);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Status Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        status={status}
        onSelectSampleTopic={handleSelectSampleTopic}
        selectedTopicName={selectedTopic.name}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* API Key Missing Info Banner (If server reports no GEMINI_API_KEY) */}
        {status && !status.hasEnvKey && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block font-semibold">
                  Gemini API Key Required:
                </strong>
                <span>
                  Please set your <code className="bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-xs">GEMINI_API_KEY</code> environment variable in your <code className="bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> file or the AI Studio Secrets panel.
                </span>
              </div>
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono shrink-0">
              Model: gemini-3.8-flash
            </span>
          </div>
        )}

        {/* Tab View Router */}
        {activeTab === 'tutor' && (
          <TutorView
            currentTopic={selectedTopic.name}
            currentSubject={selectedTopic.subject}
          />
        )}

        {activeTab === 'summarizer' && (
          <SummarizerView
            currentTopic={selectedTopic.name}
            currentNotes={selectedTopic.sampleNotes}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            currentTopic={selectedTopic.name}
            currentNotes={selectedTopic.sampleNotes}
            onQuizCompleted={handleQuizCompleted}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            currentTopic={selectedTopic.name}
            currentNotes={selectedTopic.sampleNotes}
            onCardStatusChange={handleCardStatusChange}
          />
        )}

        {activeTab === 'important_questions' && (
          <ImportantQuestionsView
            currentTopic={selectedTopic.name}
            currentNotes={selectedTopic.sampleNotes}
          />
        )}

        {activeTab === 'viva' && (
          <VivaView
            currentTopic={selectedTopic.name}
            onVivaEvaluated={handleVivaEvaluated}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanView
            currentSubject={selectedTopic.subject}
            currentSyllabus={selectedTopic.sampleSyllabus}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            currentSubject={selectedTopic.subject}
            quizzesTaken={quizzesTaken}
            avgQuizScore={avgQuizScore}
            flashcardsMastered={flashcardsMastered}
            flashcardsNeedingReview={flashcardsNeedingReview}
            vivaScore={vivaScore}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CogniStudy AI • Server-side Gemini 3.8 Flash Integration</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Official @google/genai SDK</span>
            <span>•</span>
            <span>Zero-Exposed API Keys</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
