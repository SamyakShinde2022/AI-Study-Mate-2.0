import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Lightbulb,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { QuizQuestion, QuizResult } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface QuizViewProps {
  currentTopic: string;
  currentNotes: string;
  onQuizCompleted?: (score: number, total: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ currentTopic, currentNotes, onQuizCompleted }) => {
  const [topicInput, setTopicInput] = useState(currentTopic || '');
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizType, setQuizType] = useState<'multiple_choice' | 'true_false' | 'mixed'>('multiple_choice');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizResult | null>(null);

  // Taking Quiz State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync topic input if changed externally
  React.useEffect(() => {
    if (currentTopic && (!topicInput || topicInput === '')) {
      setTopicInput(currentTopic);
    }
  }, [currentTopic]);

  const handleGenerate = async () => {
    const query = topicInput.trim() || currentNotes.trim() || 'General Science';
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setShowHint({});
    setCurrentIdx(0);

    try {
      const res = await geminiClient.generateQuiz({
        topicOrContent: query,
        questionCount: count,
        difficulty,
        type: quizType,
      });
      setQuiz(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    if (!quiz) return;
    const score = calculateScore();
    if (onQuizCompleted) {
      onQuizCompleted(score, quiz.questions.length);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((acc, q, idx) => {
      return acc + (userAnswers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setShowHint({});
  };

  const currentQ: QuizQuestion | undefined = quiz?.questions[currentIdx];
  const totalQuestions = quiz?.questions.length || 0;
  const answeredCount = Object.keys(userAnswers).length;
  const score = isSubmitted ? calculateScore() : 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Generator Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Quiz Topic or Concept Source
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Graph Algorithms, CRISPR Cas-9, Carnot Cycle, Taylor Rule..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Parameters */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Questions</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="hard">Hard (Advanced Reasoning)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Type</label>
              <select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value as 'multiple_choice' | 'true_false' | 'mixed')}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="multiple_choice">Multiple Choice (4)</option>
                <option value="true_false">True / False</option>
                <option value="mixed">Mixed Types</option>
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
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Quiz</span>
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

      {/* Quiz Interaction Card */}
      {quiz && totalQuestions > 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Header */}
          <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {quiz.topic}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {quiz.difficulty}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{quiz.quizTitle}</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Question <strong className="text-white">{currentIdx + 1}</strong> of{' '}
                <strong className="text-white">{totalQuestions}</strong>
              </span>

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                title="Restart quiz"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5">
            <div
              className="bg-indigo-500 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Quiz Body */}
          {currentQ && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Question Text */}
              <div>
                {currentQ.subtopic && (
                  <span className="text-[11px] font-medium text-slate-400 mb-1.5 block">
                    Subtopic: {currentQ.subtopic}
                  </span>
                )}
                <h4 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentIdx + 1}. {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentIdx] === optIdx;
                  const isCorrect = currentQ.correctAnswerIndex === optIdx;

                  let optionClass =
                    'border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200';

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionClass = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'border-rose-500/80 bg-rose-950/40 text-rose-200';
                    } else {
                      optionClass = 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optionClass = 'border-indigo-500 bg-indigo-600/20 text-indigo-100 ring-1 ring-indigo-500';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectAnswer(currentIdx, optIdx)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between group cursor-pointer ${optionClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-semibold shrink-0 group-hover:border-indigo-400">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{option}</span>
                      </div>

                      {isSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint Box */}
              {currentQ.hint && !isSubmitted && (
                <div>
                  {showHint[currentIdx] ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300">Nudge Hint: </strong>
                        {currentQ.hint}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowHint((prev) => ({ ...prev, [currentIdx]: true }))}
                      className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Need a hint?</span>
                    </button>
                  )}
                </div>
              )}

              {/* Explanation (Shown when submitted or in review) */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm space-y-1.5">
                  <span className="text-indigo-400 font-semibold block">
                    Pedagogical Rationale:
                  </span>
                  <p className="text-slate-200 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Bottom Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentIdx((p) => Math.max(p - 1, 0))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIdx === totalQuestions - 1 ? (
                    !isSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={answeredCount === 0}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit & Grade Quiz</span>
                      </button>
                    ) : null
                  ) : (
                    <button
                      onClick={() => setCurrentIdx((p) => Math.min(p + 1, totalQuestions - 1))}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition shadow-md shadow-indigo-600/20"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results Summary banner if submitted */}
          {isSubmitted && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-t border-slate-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Quiz Score: {score} / {totalQuestions} ({percentage}%)
                  </h4>
                  <p className="text-xs text-slate-400">
                    {percentage >= 80
                      ? 'Outstanding! You have strong conceptual mastery.'
                      : percentage >= 50
                      ? 'Good job. Review the explanations above to solidify retention.'
                      : 'Needs revision. Review missed concepts with the AI Tutor.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-1"
                >
                  <span>New Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-slate-700">
            <Layers className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Ready to Test Your Knowledge?
          </h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400 mb-6">
            Enter any topic above or click "Generate Quiz" to test yourself with tailored questions, instant grading, and step-by-step rationales.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Generate Quiz for {topicInput || currentTopic}
          </button>
        </div>
      )}
    </div>
  );
};
