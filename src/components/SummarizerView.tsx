import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertOctagon,
  KeyRound,
  FileText,
  BookmarkCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { SummaryResult } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface SummarizerViewProps {
  currentNotes: string;
  currentTopic: string;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({ currentNotes, currentTopic }) => {
  const [content, setContent] = useState(currentNotes || '');
  const [depth, setDepth] = useState<'tldr' | 'standard' | 'comprehensive'>('standard');
  const [format, setFormat] = useState<'bullets' | 'structured' | 'exam_cram'>('structured');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync if topic changes and content is empty
  React.useEffect(() => {
    if (currentNotes && !content) {
      setContent(currentNotes);
    }
  }, [currentNotes]);

  const handleSummarize = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await geminiClient.summarizeMaterial({
        content,
        depth,
        format,
      });
      setSummary(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to summarize study material.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyFullSummary = () => {
    if (!summary) return;
    const textToCopy = `=== ${summary.title} ===\n\nTL;DR:\n${summary.tldr}\n\nCORE CONCEPTS:\n${summary.coreConcepts
      .map((c) => `• ${c.name}: ${c.explanation} (Exam significance: ${c.significance})`)
      .join('\n')}\n\nKEY FORMULAS / TERMS:\n${summary.keyFormulasOrTerms
      .map((k) => `• ${k.term}: ${k.definition}`)
      .join('\n')}\n\nCOMMON EXAM TRAPS:\n${summary.commonExamTraps
      .map((t) => `⚠️ ${t}`)
      .join('\n')}\n\nQUICK REVISION RECAP:\n${summary.quickRecapBullets
      .map((b) => `✓ ${b}`)
      .join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
      {/* Left Column: Input Material & Options (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white">Study Material Source</h2>
            </div>
            <button
              onClick={() => setContent(currentNotes)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              title="Reset with current topic notes"
            >
              Insert Sample Notes
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your lecture slides, textbook chapter excerpt, revision notes, or syllabus content here..."
            className="w-full flex-1 min-h-[220px] bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed resize-none"
          />

          {/* Options: Depth and Format */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Summary Depth
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(
                  [
                    { id: 'tldr', label: 'TL;DR Cram' },
                    { id: 'standard', label: 'Balanced' },
                    { id: 'comprehensive', label: 'In-Depth' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDepth(d.id)}
                    className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                      depth === d.id
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Format Style</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(
                  [
                    { id: 'structured', label: 'Structured' },
                    { id: 'exam_cram', label: 'Exam Traps' },
                    { id: 'bullets', label: 'Quick Bullets' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                      format === f.id
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-5">
            <button
              onClick={handleSummarize}
              disabled={isLoading || !content.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini is synthesizing notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Study Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <strong>Error: </strong> {error}
          </div>
        )}
      </div>

      {/* Right Column: Structured AI Summary Output (7 cols) */}
      <div className="lg:col-span-7">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col overflow-hidden">
          {summary ? (
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Header & Copy */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-400 tracking-wider uppercase">
                    AI Condensed Study Note
                  </span>
                  <h3 className="text-xl font-bold text-white">{summary.title}</h3>
                </div>
                <button
                  onClick={copyFullSummary}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              {/* TL;DR Box */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">Executive TL;DR:</span>
                {summary.tldr}
              </div>

              {/* Core Concepts */}
              {summary.coreConcepts && summary.coreConcepts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-indigo-400" /> Core Concepts & Theoretical Foundations
                  </h4>
                  <div className="space-y-3">
                    {summary.coreConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xs space-y-1.5"
                      >
                        <div className="font-semibold text-white text-sm text-indigo-200">
                          {concept.name}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{concept.explanation}</p>
                        {concept.significance && (
                          <div className="text-[11px] text-amber-300/90 pt-1 flex items-start gap-1">
                            <span className="font-medium text-amber-400">Exam Note:</span>
                            {concept.significance}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Formulas or Terms */}
              {summary.keyFormulasOrTerms && summary.keyFormulasOrTerms.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" /> Key Terms & Equation Cheat Sheet
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {summary.keyFormulasOrTerms.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                      >
                        <div className="font-mono font-semibold text-emerald-400 mb-1">
                          {item.term}
                        </div>
                        <div className="text-slate-300 leading-relaxed">{item.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Exam Traps */}
              {summary.commonExamTraps && summary.commonExamTraps.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
                  <h4 className="text-xs font-semibold uppercase text-rose-300 tracking-wider mb-2.5 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-400" /> Common Exam Pitfalls & Blunders
                  </h4>
                  <ul className="space-y-1.5 text-xs text-rose-200/90 list-disc list-inside">
                    {summary.commonExamTraps.map((trap, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {trap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Recap Bullets */}
              {summary.quickRecapBullets && summary.quickRecapBullets.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2.5">
                    ⚡ 60-Second Revision Bullets
                  </h4>
                  <div className="space-y-1.5">
                    {summary.quickRecapBullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-200 flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40"
                      >
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-indigo-400 border border-slate-700">
                <BookOpen className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                No Summary Generated Yet
              </h3>
              <p className="text-xs max-w-sm text-slate-400 mb-6">
                Paste your lecture notes, textbook chapters, or articles on the left, choose your depth, and click Generate to let Gemini synthesize high-yield study material.
              </p>
              <button
                onClick={handleSummarize}
                disabled={!content.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition"
              >
                Summarize current topic notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
