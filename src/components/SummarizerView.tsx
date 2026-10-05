import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
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
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyFullSummary = () => {
    if (!summary) return;
    const textToCopy = `=== ${summary.title} ===\n\nTL;DR:\n${summary.tldr}\n\nCORE CONCEPTS:\n${summary.coreConcepts
      .map((c) => `• ${c.name}: ${c.explanation} (Significance: ${c.significance})`)
      .join('\n')}\n\nKEY TERMS:\n${summary.keyFormulasOrTerms
      .map((k) => `• ${k.term}: ${k.definition}`)
      .join('\n')}\n\nEXAM PITFALLS:\n${summary.commonExamTraps
      .map((t) => `⚠️ ${t}`)
      .join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Study Material Summarizer</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Synthesize dense lecture notes or textbook chapters into high-yield takeaways and cheat sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Notes & Options (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Source Notes / Content</label>
              <button
                onClick={() => setContent(currentNotes)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Insert Preset
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste notes, textbook chapter excerpts, or articles here..."
              rows={9}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none leading-relaxed"
            />

            <div className="space-y-3 pt-1 border-t border-slate-100 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1.5">Summary Depth</label>
                <div className="grid grid-cols-3 gap-1.5">
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
                      className={`py-1.5 px-2 rounded-lg font-medium border text-center transition cursor-pointer ${
                        depth === d.id
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1.5">Format</label>
                <div className="grid grid-cols-3 gap-1.5">
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
                      className={`py-1.5 px-2 rounded-lg font-medium border text-center transition cursor-pointer ${
                        format === f.id
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSummarize}
              disabled={isLoading || !content.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Summarize Material</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Clean Light Mode Summary Output (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
            {summary ? (
              <div className="space-y-5 overflow-y-auto pr-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                      Executive Summary
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{summary.title}</h3>
                  </div>
                  <button
                    onClick={copyFullSummary}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>

                {/* TLDR */}
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs sm:text-sm text-indigo-950 leading-relaxed">
                  <span className="font-bold text-indigo-800 block mb-1">TL;DR:</span>
                  {summary.tldr}
                </div>

                {/* Core Concepts */}
                {summary.coreConcepts && summary.coreConcepts.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Core Concepts
                    </h4>
                    <div className="space-y-2">
                      {summary.coreConcepts.map((c, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                          <strong className="text-slate-900 block">{c.name}</strong>
                          <p className="text-slate-600 leading-relaxed">{c.explanation}</p>
                          {c.significance && (
                            <span className="text-[11px] text-amber-800 block font-medium">
                              Note: {c.significance}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms / Cheat sheet */}
                {summary.keyFormulasOrTerms && summary.keyFormulasOrTerms.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Key Formulas & Terms
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {summary.keyFormulasOrTerms.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <strong className="font-mono text-indigo-700 block mb-0.5">{item.term}</strong>
                          <span className="text-slate-600">{item.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Traps */}
                {summary.commonExamTraps && summary.commonExamTraps.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs space-y-1.5">
                    <strong className="text-rose-700 block font-bold">⚠️ Common Exam Pitfalls:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {summary.commonExamTraps.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto py-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-700">No Summary Generated</h4>
                <p className="text-xs max-w-xs mx-auto text-slate-400">
                  Paste notes on the left and click "Summarize Material" to generate a clean structured study note.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
