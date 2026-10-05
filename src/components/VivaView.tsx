import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Volume2,
  ChevronRight,
  Send,
} from 'lucide-react';
import { VivaEvaluationResult, VivaQuestionData, VivaTurn } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface VivaViewProps {
  currentTopic: string;
  onVivaEvaluated?: (score: number) => void;
}

export const VivaView: React.FC<VivaViewProps> = ({ currentTopic, onVivaEvaluated }) => {
  const [topicInput, setTopicInput] = useState(currentTopic || '');
  const [level, setLevel] = useState<'introductory' | 'in_depth' | 'practical_lab' | 'stress_test'>('in_depth');

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active session
  const [currentQuestion, setCurrentQuestion] = useState<VivaQuestionData | null>(null);
  const [studentInput, setStudentInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pastTurns, setPastTurns] = useState<VivaTurn[]>([]);

  // Speech Recognition setup (if supported in browser)
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setStudentInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your answer.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Could not start microphone:', err);
      }
    }
  };

  const startOrNextViva = async (overrideTopic?: string) => {
    const topic = overrideTopic || topicInput.trim() || currentTopic || 'Computer Science';
    setIsLoadingQuestion(true);
    setError(null);
    setStudentInput('');

    try {
      const previousQuestions = pastTurns.map((t) => t.question);
      const res = await geminiClient.generateVivaQuestion({
        topic,
        level,
        previousQuestions,
      });
      setCurrentQuestion(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate viva question.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleEvaluate = async () => {
    if (!currentQuestion || !studentInput.trim() || isEvaluating) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setIsEvaluating(true);
    setError(null);

    try {
      const evalResult: VivaEvaluationResult = await geminiClient.evaluateVivaAnswer({
        topic: topicInput || currentTopic,
        question: currentQuestion.question,
        studentAnswer: studentInput,
      });

      const newTurn: VivaTurn = {
        id: `turn-${Date.now()}`,
        question: currentQuestion.question,
        studentAnswer: studentInput,
        evaluation: evalResult,
      };

      setPastTurns((prev) => [newTurn, ...prev]);
      if (onVivaEvaluated) {
        onVivaEvaluated(evalResult.overallScore);
      }

      // If follow-up exists, automatically prompt next question
      if (evalResult.followUpQuestion) {
        setCurrentQuestion({
          question: evalResult.followUpQuestion,
          context: 'Follow-up probe to test depth of student understanding.',
          examinerPersona: currentQuestion.examinerPersona || 'Chief External Examiner',
          expectedDimensions: ['Precision', 'Edge cases', 'Formal synthesis'],
        });
        setStudentInput('');
      } else {
        setCurrentQuestion(null);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to evaluate viva answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-indigo-400" />
              Viva Voce Examination Subject / Project
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Operating Systems Kernel, Organic Synthesis, Neural Networks..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Examiner Style</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="introductory">Friendly / Introductory</option>
                <option value="in_depth">Academic Standard (Rigorous)</option>
                <option value="practical_lab">Practical & Lab Applications</option>
                <option value="stress_test">Stress-Test (Challenging)</option>
              </select>
            </div>

            <button
              onClick={() => startOrNextViva()}
              disabled={isLoadingQuestion || isEvaluating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/25 h-[38px] mt-auto"
            >
              {isLoadingQuestion ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentQuestion ? 'Ask Next Viva Q' : 'Begin Viva Exam'}</span>
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

      {/* Active Question & Answer Box */}
      {currentQuestion ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Examiner Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {currentQuestion.examinerPersona || 'External Academic Examiner'}
                </span>
                <span className="text-[11px] text-slate-400">Oral Viva Examination</span>
              </div>
            </div>

            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
              Live Question
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
              "{currentQuestion.question}"
            </p>
            {currentQuestion.context && (
              <p className="text-xs text-slate-400 italic">
                Intent: {currentQuestion.context}
              </p>
            )}
          </div>

          {/* Student Answer Input Area */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Your Spoken or Written Response:</span>
              {isRecording && (
                <span className="text-rose-400 flex items-center gap-1.5 animate-pulse font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Recording microphone audio...
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                placeholder="Speak clearly into your microphone or type your comprehensive oral response here..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />

              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Dictate with Microphone'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isRecording ? 'Stop' : 'Voice'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !studentInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Response</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-slate-700">
            <Mic className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Simulate Your Oral Viva Voce Exam
          </h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400 mb-6">
            Practice answering real-time examiner questions verbally or in writing. Get graded on Technical Accuracy, Conceptual Depth, and Clarity with ideal model responses.
          </p>
          <button
            onClick={() => startOrNextViva()}
            disabled={isLoadingQuestion}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Start Viva Exam for {topicInput || currentTopic}
          </button>
        </div>
      )}

      {/* Past Evaluated Viva Questions & Rubrics */}
      {pastTurns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            Viva Voce Examination Transcript & Feedback ({pastTurns.length})
          </h3>

          <div className="space-y-4">
            {pastTurns.map((turn) => {
              const ev = turn.evaluation;
              if (!ev) return null;

              const isHigh = ev.overallScore >= 8;
              const isMed = ev.overallScore >= 5;

              return (
                <div
                  key={turn.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md"
                >
                  {/* Question and Score Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase">
                        Question
                      </span>
                      <h4 className="text-sm sm:text-base font-semibold text-white">
                        {turn.question}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-center font-bold text-xs ${
                          isHigh
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : isMed
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <div>Score: {ev.overallScore} / 10</div>
                        <div className="text-[10px] font-normal uppercase">{ev.verdict}</div>
                      </div>
                    </div>
                  </div>

                  {/* Student Answer Record */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Your Spoken Answer:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{turn.studentAnswer}</p>
                  </div>

                  {/* Breakdown Scores */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-slate-400 text-[11px] block">Technical Accuracy</span>
                      <strong className="text-white text-sm">
                        {ev.scoreBreakdown.technicalAccuracy} / 10
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-slate-400 text-[11px] block">Conceptual Depth</span>
                      <strong className="text-white text-sm">
                        {ev.scoreBreakdown.conceptualDepth} / 10
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <span className="text-slate-400 text-[11px] block">Clarity & Articulation</span>
                      <strong className="text-white text-sm">
                        {ev.scoreBreakdown.clarityAndStructure} / 10
                      </strong>
                    </div>
                  </div>

                  {/* Strengths & Missing Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {ev.strengths && ev.strengths.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 space-y-1">
                        <span className="font-semibold text-emerald-300 block flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> What You Answered Well:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-200">
                          {ev.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ev.missingKeyPoints && ev.missingKeyPoints.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-1">
                        <span className="font-semibold text-rose-300 block flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Key Nuances You Missed:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-200">
                          {ev.missingKeyPoints.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Ideal Model Answer */}
                  {ev.idealModelAnswer && (
                    <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs sm:text-sm space-y-1">
                      <span className="font-bold text-indigo-300 block">
                        Examiner's Ideal Model Answer:
                      </span>
                      <p className="text-slate-200 leading-relaxed">{ev.idealModelAnswer}</p>
                    </div>
                  )}

                  {/* Examiner Comment */}
                  {ev.examinerComment && (
                    <div className="text-xs text-slate-400 italic">
                      Examiner's Note: "{ev.examinerComment}"
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
