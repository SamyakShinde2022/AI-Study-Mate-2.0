import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  Key,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { ImportantQuestionsResult, StudyMaterial } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface ImportantQuestionsViewProps {
  activeMaterial: StudyMaterial | null;
}

export const ImportantQuestionsView: React.FC<ImportantQuestionsViewProps> = ({ activeMaterial }) => {
  const [topicInput, setTopicInput] = useState(activeMaterial?.title || 'Data Structures & Algorithms');
  const [examType, setExamType] = useState<'university_semester' | 'competitive_entrance' | 'board_exam' | 'general'>(
    'university_semester'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportantQuestionsResult | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (activeMaterial && (!topicInput || topicInput === 'Data Structures & Algorithms')) {
      setTopicInput(activeMaterial.title);
    }
  }, [activeMaterial]);

  const handleGenerate = async () => {
    const query = topicInput.trim() || activeMaterial?.content || 'Computer Science';
    setIsLoading(true);
    setError(null);

    try {
      const res = await geminiClient.generateImportantQuestions({
        topicOrContent: activeMaterial ? `${activeMaterial.title}\n${activeMaterial.content}` : query,
        examType,
        difficulty: 'high_yield',
      });
      setResult(res);
      if (res.questions.length > 0) {
        setExpandedId(res.questions[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyQuestions = () => {
    if (!result) return;
    const text = `=== IMPORTANT EXAM QUESTIONS: ${result.subject} ===\n\n` +
      result.questions
        .map(
          (q, i) =>
            `${i + 1}. [${q.marksWeightage} Marks | ${q.frequencyLikelihood}]\n${q.question}\nKeywords: ${q.keyKeywordsToInclude.join(', ')}\nAnswer Framework:\n${q.answerFramework.map((s) => `  - ${s}`).join('\n')}\n`
        )
        .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">High-Yield Exam Questions</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Predict and master the most probable semester and entrance exam questions with mark weightage and rubric keywords.
        </p>
      </div>

      {/* Input Generator */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-700">Exam Subject or Module</label>
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Recursion & Trees, Quantum Mechanics, Macroeconomics..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-600"
          >
            <option value="university_semester">University Semester</option>
            <option value="competitive_entrance">Competitive Entrance</option>
            <option value="board_exam">Board Exam</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !topicInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Predict Qs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Questions Output List */}
      {result && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-indigo-900 block">Exam Strategy Blueprint:</span>
              <p className="text-slate-600 mt-0.5">{result.examStrategy}</p>
            </div>
            <button
              onClick={copyQuestions}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Export'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {result.questions.map((q, idx) => {
              const isExpanded = expandedId === q.id;
              return (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200/90 rounded-xl overflow-hidden transition shadow-xs"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600">Q{idx + 1}</span>
                        <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                          {q.marksWeightage} Marks ({q.questionCategory})
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-100">
                          ★ {q.frequencyLikelihood} Likelihood
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{q.question}</h4>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                      <div className="pt-2">
                        <strong className="text-slate-900 block mb-1">Answer Framework:</strong>
                        <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                          {q.answerFramework.map((step, sIdx) => (
                            <div key={sIdx} className="text-slate-700">
                              {sIdx + 1}. {step}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <strong className="text-slate-900 block mb-1">Key Rubric Keywords:</strong>
                        <div className="flex flex-wrap gap-1">
                          {q.keyKeywordsToInclude.map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono text-[11px]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {q.commonMistakes && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700">
                          <strong>Common Error: </strong>
                          {q.commonMistakes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
