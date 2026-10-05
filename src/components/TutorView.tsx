import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Paperclip,
  Check,
  Copy,
  Lightbulb,
  Compass,
  FileText,
  RotateCcw,
  Bot,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { AiMode, ChatMessage, StudyMaterial, TutorStyle } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';

interface TutorViewProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  activeMaterial: StudyMaterial | null;
  allMaterials: StudyMaterial[];
  onSelectMaterial: (m: StudyMaterial) => void;
}

export const TutorView: React.FC<TutorViewProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  activeMaterial,
  allMaterials,
  onSelectMaterial,
}) => {
  const [mode, setMode] = useState<AiMode>(activeMaterial ? 'material' : 'general');
  const [style, setStyle] = useState<TutorStyle>('intuitive');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hey! I'm **StudyMate** 👋

Think of me as your personal study partner and senior who loves breaking down tough concepts without the textbook fluff.

Here's how I can help:
- **Tackle tricky concepts** in plain English with real-world analogies 🧠
- **Solve math & physics equations** step-by-step ⚡
- **Write, debug, and optimize code** with clean explanations 💻
- **Prep high-yield exam takeaways** so you ace your tests 📚

What are we studying today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      keyTakeaway: 'Great learning happens when you connect core principles to simple intuition.',
      followUpQuestions: [
        'Explain recursion in simple words 🧠',
        'What are Newton’s three laws of motion? ⚡',
        'How does a binary search tree work? 🌲',
      ],
      mode: 'general',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initial prompt passed from Dashboard search
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // If active material changes, set mode to material if applicable
  useEffect(() => {
    if (activeMaterial) {
      setMode('material');
    }
  }, [activeMaterial]);

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || input).trim();
    if (!textToSend || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode,
      materialTitle: mode === 'material' ? activeMaterial?.title : undefined,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const history = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await geminiClient.askTutor({
        message: textToSend,
        mode,
        materialContent: mode === 'material' ? activeMaterial?.content : undefined,
        materialTitle: mode === 'material' ? activeMaterial?.title : undefined,
        style,
        history,
      });

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyTakeaway: res.keyTakeaway,
        followUpQuestions: res.followUpQuestions,
        mode,
        materialTitle: mode === 'material' ? activeMaterial?.title : undefined,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        text: "Chat cleared. What topic or problem would you like to explore next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'general',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)] min-h-[580px] bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* 1. Header: AI Tutor & Mode Switcher */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">AI Tutor</h2>
            <span className="text-[11px] text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              Ask me anything you're learning.
            </span>
          </div>
        </div>

        {/* Mode & Attachment Selector */}
        <div className="flex items-center gap-2">
          {/* Mode Pill Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMode('general')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                mode === 'general'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              General AI
            </button>
            <button
              onClick={() => {
                if (!activeMaterial && allMaterials.length > 0) {
                  onSelectMaterial(allMaterials[0]);
                }
                setMode('material');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 cursor-pointer ${
                mode === 'material'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Paperclip className="w-3 h-3" />
              <span>Study Material AI</span>
            </button>
          </div>

          {/* Active Material dropdown indicator if in material mode */}
          {mode === 'material' && (
            <div className="relative">
              <button
                onClick={() => setShowMaterialPicker(!showMaterialPicker)}
                className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition truncate max-w-[150px] sm:max-w-[190px]"
                title={activeMaterial?.title || 'Attach a document'}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{activeMaterial?.title || 'Choose Document'}</span>
              </button>

              {showMaterialPicker && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMaterialPicker(false)}
                  />
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase">
                      Select Reference Document:
                    </div>
                    {allMaterials.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectMaterial(m);
                          setShowMaterialPicker(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                          activeMaterial?.id === m.id
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{m.title}</span>
                        {activeMaterial?.id === m.id && (
                          <Check className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Clear button */}
          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Chat Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAFAFA]">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
            >
              {/* Header metadata label */}
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                <span className="font-medium text-slate-600">
                  {isModel ? 'StudyMate' : 'You'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.materialTitle && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 font-medium truncate max-w-[140px]">
                      📄 {msg.materialTitle}
                    </span>
                  </>
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`max-w-2xl sm:max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isModel
                    ? 'bg-white text-slate-900 border border-slate-200/90'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {/* Text Content with proper code blocks & headers */}
                {isModel ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <div className="whitespace-pre-wrap font-sans leading-relaxed text-xs sm:text-sm font-medium">
                    {msg.text}
                  </div>
                )}

                {/* Key Takeaway box */}
                {isModel && msg.keyTakeaway && (
                  <div className="mt-3.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 flex items-start gap-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-700">Key Takeaway: </span>
                      {msg.keyTakeaway}
                    </div>
                  </div>
                )}

                {/* Recommended Follow-up Suggestions */}
                {isModel && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Suggested follow-ups:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followUpQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          disabled={isLoading}
                          className="text-left text-xs bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-200 px-2.5 py-1.5 rounded-lg transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy button for model responses */}
                {isModel && (
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-xl px-4 py-3 max-w-xs shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>StudyMate is thinking...</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <strong>Error: </strong> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Input & Suggestion Chips */}
      <div className="p-4 bg-white border-t border-slate-100 space-y-3">
        {/* Only 3-4 Quick Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => handleSend('Explain this concept simply with a real-world analogy')}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition"
          >
            💡 Explain simply
          </button>
          <button
            onClick={() => handleSend('Give me a clear, concrete example of how this is applied')}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition"
          >
            🔍 Give an example
          </button>
          <button
            onClick={() => handleSend('Walk me through solving a realistic practice problem step-by-step')}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition"
          >
            📝 Practice step-by-step
          </button>
          <button
            onClick={() => handleSend('Quiz me on this! Ask me one question to test my understanding')}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition"
          >
            ❓ Quiz me
          </button>
        </div>

        {/* Main Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'material' && activeMaterial
                ? `Ask StudyMate about "${activeMaterial.title}"...`
                : 'Ask StudyMate anything (e.g. What is recursion?, Explain Newton’s second law)...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-semibold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
