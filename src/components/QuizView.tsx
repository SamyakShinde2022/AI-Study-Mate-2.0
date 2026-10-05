import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { QuizQuestion, QuizResult, StudyMaterial } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface QuizViewProps {
  activeMaterial: StudyMaterial | null;
  onQuizCompleted?: (score: number, total: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ activeMaterial, onQuizCompleted }) => {
  const [topicInput, setTopicInput] = useState(activeMaterial?.title || 'Data Structures & Algorithms');
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizResult | null>(null);

  // Stepper state: one question at a time
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  React.useEffect(() => {
    if (activeMaterial && (!topicInput || topicInput === 'Data Structures & Algorithms')) {
      setTopicInput(activeMaterial.title);
    }
  }, [activeMaterial]);

  const handleGenerate = async () => {
    const query = topicInput.trim() || activeMaterial?.content || 'General Science';
    setIsLoading(true);
    setError(null);
    setIsCompleted(false);
    setUserAnswers({});
    setShowHint({});
    setCurrentIndex(0);

    try {
      const res = await geminiClient.generateQuiz({
        topicOrContent: activeMaterial ? `${activeMaterial.title}\n${activeMaterial.content}` : query,
        questionCount: count,
        difficulty,
        type: 'multiple_choice',
      });
      setQuiz(res);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    if (isCompleted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((acc, q, idx) => {
      return acc + (userAnswers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      const score = calculateScore();
      if (onQuizCompleted) {
        onQuizCompleted(score, quiz.questions.length);
      }
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setShowHint({});
  };

  const currentQ: QuizQuestion | undefined = quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const score = isCompleted ? calculateScore() : 0;
  const incorrect = totalQuestions - score;
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Top Generator Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Quiz Topic or Subject</label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Recursion in C++, Newton’s Laws, OSI Model, Photosynthesis..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-600"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={8}>8 Questions</option>
              <option value={10}>10 Questions</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-600"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !topicInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Main Single Question Stepper Card */}
      {quiz && totalQuestions > 0 && !isCompleted && currentQ && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Stepper Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500">
            <span className="font-semibold text-indigo-600">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="capitalize">{difficulty} difficulty</span>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h3>

          {/* Options (One question at a time) */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = userAnswers[currentIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => selectAnswer(currentIndex, optIdx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950 font-medium ring-1 ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 border ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {currentQ.hint && (
            <div className="text-xs">
              {showHint[currentIndex] ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hint:</strong> {currentQ.hint}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint((prev) => ({ ...prev, [currentIndex]: true }))}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Show a hint</span>
                </button>
              )}
            </div>
          )}

          {/* Bottom Stepper Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-xl text-xs font-medium transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={userAnswers[currentIndex] === undefined}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{currentIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Clean Completion Screen */}
      {isCompleted && quiz && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quiz Completed!</h3>
            <p className="text-xs text-slate-500">
              Here is your performance breakdown for {quiz.topic}
            </p>
          </div>

          {/* 4 Clean Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Score</span>
              <strong className="text-base text-slate-900">{score} / {totalQuestions}</strong>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Correct</span>
              <strong className="text-base text-emerald-600">{score}</strong>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Incorrect</span>
              <strong className="text-base text-rose-600">{incorrect}</strong>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Accuracy</span>
              <strong className="text-base text-indigo-600">{accuracy}%</strong>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs sm:text-sm text-indigo-950 space-y-1">
            <span className="font-bold text-indigo-800 block">AI Feedback:</span>
            <p className="leading-relaxed">
              {accuracy >= 80
                ? 'Excellent work! You demonstrate solid conceptual understanding. Practice edge cases to achieve mastery.'
                : accuracy >= 60
                ? 'Good effort! Review the questions you missed and test yourself again to solidify retention.'
                : 'Needs more revision. We recommend reading through the notes with the AI Tutor and retaking the quiz.'}
            </p>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Review Answers
            </h4>
            <div className="space-y-3">
              {quiz.questions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      isCorrect ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/30 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </div>

                    <p className="text-slate-600">
                      <strong>Correct Answer: </strong>
                      {q.options[q.correctAnswerIndex]}
                    </p>

                    <p className="text-slate-500 leading-relaxed pt-1">
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleRetake}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Generate New Quiz
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!quiz && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">Quiz Generator</h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400">
            Enter any topic above or click Generate to test yourself one question at a time with instant feedback and explanations.
          </p>
        </div>
      )}
    </div>
  );
};
