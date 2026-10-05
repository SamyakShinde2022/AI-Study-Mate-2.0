import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Award,
  Send,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { StudyMaterial, VivaEvaluationResult, VivaQuestionData, VivaTurn } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface VivaViewProps {
  activeMaterial: StudyMaterial | null;
}

export const VivaView: React.FC<VivaViewProps> = ({ activeMaterial }) => {
  const [topicInput, setTopicInput] = useState(activeMaterial?.title || 'Data Structures & Algorithms');
  const [level, setLevel] = useState<'introductory' | 'in_depth' | 'practical_lab' | 'stress_test'>('in_depth');

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<VivaQuestionData | null>(null);
  const [studentInput, setStudentInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pastTurns, setPastTurns] = useState<VivaTurn[]>([]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
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

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Mic error', err);
      }
    }
  };

  const handleStartOrNextQuestion = async () => {
    const topic = topicInput.trim() || activeMaterial?.title || 'Computer Science';
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
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
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
        topic: topicInput,
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

      if (evalResult.followUpQuestion) {
        setCurrentQuestion({
          question: evalResult.followUpQuestion,
          context: 'Follow-up question to test depth.',
          examinerPersona: currentQuestion.examinerPersona || 'External Examiner',
          expectedDimensions: ['Precision', 'Edge cases'],
        });
        setStudentInput('');
      } else {
        setCurrentQuestion(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Viva Voce Oral Exam Simulator</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Simulate university oral examinations. Speak or type your answer and receive instant rubric grading.
        </p>
      </div>

      {/* Input Config */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-700">Viva Voce Topic</label>
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Operating Systems, CRISPR Cas9, Macroeconomics..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-600"
          >
            <option value="introductory">Introductory</option>
            <option value="in_depth">Academic Standard</option>
            <option value="practical_lab">Practical / Lab</option>
            <option value="stress_test">Challenging</option>
          </select>

          <button
            onClick={handleStartOrNextQuestion}
            disabled={isLoadingQuestion || isEvaluating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            {isLoadingQuestion ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentQuestion ? 'Next Question' : 'Start Exam'}</span>
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

      {/* Active Examiner Question Box */}
      {currentQuestion && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                {currentQuestion.examinerPersona || 'External Examiner'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Active Question
            </span>
          </div>

          <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
            "{currentQuestion.question}"
          </p>

          {/* Student Answer */}
          <div className="space-y-2">
            <textarea
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder="Speak into your microphone or type your spoken response here..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  isRecording
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Stop Recording' : 'Voice Dictate'}</span>
              </button>

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating || !studentInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript List */}
      {pastTurns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Examiner Evaluation History ({pastTurns.length})
          </h3>

          <div className="space-y-3">
            {pastTurns.map((turn) => {
              const ev = turn.evaluation;
              if (!ev) return null;
              return (
                <div key={turn.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Question</span>
                      <h4 className="font-semibold text-slate-900 text-xs sm:text-sm mt-0.5">{turn.question}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-indigo-600">{ev.overallScore} / 10</span>
                      <span className="block text-[10px] text-slate-400 uppercase">{ev.verdict}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-medium text-slate-500 block mb-0.5">Your Response:</span>
                    <p className="text-slate-800">{turn.studentAnswer}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-950">
                      <strong className="text-emerald-800 block mb-1">Well Done:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {ev.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-950">
                      <strong className="text-rose-800 block mb-1">Missed Points:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {ev.missingKeyPoints.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {ev.idealModelAnswer && (
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-800">
                      <strong className="text-indigo-900 block mb-0.5">Ideal Examiner Answer:</strong>
                      <p className="leading-relaxed">{ev.idealModelAnswer}</p>
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
