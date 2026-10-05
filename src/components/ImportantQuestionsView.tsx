import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  RefreshCw,
  Award,
  AlertTriangle,
  Key,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ImportantQuestionsResult } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface ImportantQuestionsViewProps {
  currentTopic: string;
  currentNotes: string;
}

export const ImportantQuestionsView: React.FC<ImportantQuestionsViewProps> = ({
  currentTopic,
  currentNotes,
}) => {
  const [topicInput, setTopicInput] = useState(currentTopic || '');
  const [examType, setExamType] = useState<'university_semester' | 'competitive_entrance' | 'board_exam' | 'general'>(
    'university_semester'
  );
  const [difficulty, setDifficulty] = useState<'standard' | 'high_yield' | 'challenger'>('high_yield');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportantQuestionsResult | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (currentTopic && (!topicInput || topicInput === '')) {
      setTopicInput(currentTopic);
    }
  }, [currentTopic]);

  const handleGenerate = async () => {
    const query = topicInput.trim() || currentNotes.trim() || 'Engineering Mechanics';
    setIsLoading(true);
    setError(null);

    try {
      const res = await geminiClient.generateImportantQuestions({
        topicOrContent: query,
        examType,
        difficulty,
      });
      setResult(res);
      if (res.questions.length > 0) {
        setExpandedId(res.questions[0].id);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to predict exam questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyQuestions = () => {
    if (!result) return;
    const text = `=== IMPORTANT EXAM QUESTIONS: ${result.subject} ===\n\nExam Strategy: ${result.examStrategy}\n\n` +
      result.questions
        .map(
          (q, i) =>
            `${i + 1}. [${q.marksWeightage} Marks | ${q.frequencyLikelihood} Probability]\nQuestion: ${q.question}\n\nKeywords: ${q.keyKeywordsToInclude.join(', ')}\nAnswer Framework:\n${q.answerFramework.map((s) => `  - ${s}`).join('\n')}\nCommon Mistake: ${q.commonMistakes}\n`
        )
        .join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search / Config Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileQuestion className="w-4 h-4 text-indigo-400" />
              Syllabus Unit / Subject Focus
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Dynamic Programming, Molecular Genetics, Maxwell Relations..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Exam</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="university_semester">University Semester</option>
                <option value="competitive_entrance">Competitive Entrance</option>
                <option value="board_exam">Board Exam</option>
                <option value="general">Standard Academic</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Likelihood Filter</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="high_yield">High-Yield Must Knows</option>
                <option value="standard">Standard Mix</option>
                <option value="challenger">Top Distinction / Rankers</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !topicInput.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/25 h-[38px] mt-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Predicting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Predict Questions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <strong>Error: </strong> {error}
          </div>
        )}
      </div>

      {/* Questions Output List */}
      {result ? (
        <div className="space-y-4">
          {/* Strategy Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                Exam Strategy Blueprint • {result.subject}
              </span>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 leading-relaxed">
                {result.examStrategy}
              </p>
            </div>
            <button
              onClick={copyQuestions}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 shrink-0 transition"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export List</span>
                </>
              )}
            </button>
          </div>

          {/* Questions Accordion */}
          <div className="space-y-3">
            {result.questions.map((q, idx) => {
              const isExpanded = expandedId === q.id;

              const badgeColor =
                q.frequencyLikelihood === 'Crucial'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  : q.frequencyLikelihood === 'Very High'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';

              return (
                <div
                  key={q.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition shadow-sm"
                >
                  {/* Clickable Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-800/50 transition"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400">
                          Q{idx + 1}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {q.marksWeightage} Marks ({q.questionCategory})
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                          ★ {q.frequencyLikelihood} Probability
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-white leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <button className="p-1 rounded-lg text-slate-400 hover:text-white shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Body: Framework, Keywords, Traps */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4 text-xs">
                      {/* Answer Framework */}
                      <div className="mt-4">
                        <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-400" />
                          Mark-Scoring Answer Structure:
                        </span>
                        <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                          {q.answerFramework.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-slate-200">
                              <span className="text-indigo-400 font-bold shrink-0">{sIdx + 1}.</span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Examiner Keywords */}
                      <div>
                        <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-400" />
                          Mandatory Marking Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {q.keyKeywordsToInclude.map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Common Pitfall */}
                      {q.commonMistakes && (
                        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-rose-300">Common Student Error: </strong>
                            {q.commonMistakes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-slate-700">
            <FileQuestion className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Predict High-Yield Exam Questions
          </h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400 mb-6">
            Get high-probability semester and entrance exam questions complete with 2M/5M/10M weightage, ideal answer structures, and marking criteria.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Generate Questions for {topicInput || currentTopic}
          </button>
        </div>
      )}
    </div>
  );
};
