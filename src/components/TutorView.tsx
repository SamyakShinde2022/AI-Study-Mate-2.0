import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Send,
  Sparkles,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import { ChatMessage, TutorStyle } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface TutorViewProps {
  currentTopic: string;
  currentSubject: string;
}

export const TutorView: React.FC<TutorViewProps> = ({ currentTopic, currentSubject }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your **Gemini AI Academic Tutor**. 
I'm ready to help you master **${currentTopic || 'any topic'}** in **${currentSubject || 'General Studies'}**.

Ask me to explain any difficult concept, solve a complex equation, provide an intuitive analogy, or test your understanding!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      keyTakeaway: 'Active inquiry and breaking ideas down into simpler mental models is the fastest path to mastery.',
      followUpQuestions: [
        `Explain the core intuition of ${currentTopic || 'this topic'} in simple terms.`,
        'Walk me through a challenging problem step-by-step.',
        'What are the most common misconceptions on exams?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<TutorStyle>('intuitive');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (userPrompt?: string) => {
    const messageToSend = (userPrompt || input).trim();
    if (!messageToSend || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Reconstruct conversation history for context
      const history = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await geminiClient.askTutor({
        message: messageToSend,
        topic: currentTopic,
        subject: currentSubject,
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
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      setError((err as Error).message || 'Failed to get tutor response.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Tutor Sub-Header */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Gemini AI Tutor
              <span className="text-[11px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {currentTopic}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive pedagogical guidance with active recall prompting
            </p>
          </div>
        </div>

        {/* Pedagogy Style Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/70 text-xs">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Style:</span>
          {(
            [
              { id: 'intuitive', label: 'Intuitive' },
              { id: 'first-principles', label: 'First Principles' },
              { id: 'exam-focused', label: 'Exam Focus' },
              { id: 'socratic', label: 'Socratic' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setStyle(item.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                style === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400 px-1">
                <span>{isModel ? 'AI Tutor (Gemini)' : 'You'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-md ${
                  isModel
                    ? 'bg-slate-800/90 text-slate-100 border border-slate-700/70'
                    : 'bg-indigo-600 text-white border border-indigo-500 shadow-indigo-600/10'
                }`}
              >
                {/* Content */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.text}
                </div>

                {/* Key Takeaway Card if available */}
                {msg.keyTakeaway && (
                  <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Core Takeaway: </span>
                      {msg.keyTakeaway}
                    </div>
                  </div>
                )}

                {/* Follow up prompts */}
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700/70">
                    <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Recommended Follow-ups:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.followUpQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickPrompt(q)}
                          disabled={isLoading}
                          className="text-left text-xs bg-slate-900/80 hover:bg-indigo-950/70 text-slate-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/40 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 group"
                        >
                          <span className="line-clamp-1">{q}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy button */}
                {isModel && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => copyText(msg.id, msg.text)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                      title="Copy explanation"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
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

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Gemini is generating your personalized tutor response...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <strong>Error: </strong> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 sm:p-4 bg-slate-800/90 border-t border-slate-700/60">
        {/* Quick starter chips */}
        <div className="flex gap-2 mb-2.5 overflow-x-auto scrollbar-none pb-1 text-xs">
          <button
            onClick={() => handleQuickPrompt(`Break down the hardest concept in ${currentTopic} into simple terms.`)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 transition"
          >
            💡 Simplify Core Concept
          </button>
          <button
            onClick={() => handleQuickPrompt(`Give me a realistic practice exam question on ${currentTopic} and guide me through solving it.`)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 transition"
          >
            📝 Practice Problem
          </button>
          <button
            onClick={() => handleQuickPrompt(`What are the key formulas, definitions, and equations I must memorize for ${currentTopic}?`)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 transition"
          >
            📐 Key Formulas
          </button>
          <button
            onClick={() => handleQuickPrompt(`Test me! Ask me a conceptual question about ${currentTopic} to check my understanding.`)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 transition"
          >
            ❓ Quiz Me Now
          </button>
        </div>

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
            placeholder={`Ask Gemini Tutor about ${currentTopic || 'any subject'}...`}
            disabled={isLoading}
            className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask Tutor</span>
          </button>
        </form>
      </div>
    </div>
  );
};
