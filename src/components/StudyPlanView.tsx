import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  RefreshCw,
  Clock,
  Target,
  CheckCircle2,
  Copy,
  Check,
  Compass,
  ListTodo,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';
import { StudyPlanResult } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface StudyPlanViewProps {
  currentSubject: string;
  currentSyllabus: string;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({ currentSubject, currentSyllabus }) => {
  const [subject, setSubject] = useState(currentSubject || 'Computer Science');
  const [syllabus, setSyllabus] = useState(currentSyllabus || '');
  const [days, setDays] = useState<number>(7);
  const [dailyHours, setDailyHours] = useState<number>(4);
  const [targetScore, setTargetScore] = useState('90%+ (Distinction)');
  const [masteryLevel, setMasteryLevel] = useState<'beginner' | 'intermediate' | 'revision_ready'>('intermediate');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StudyPlanResult | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (currentSyllabus && !syllabus) {
      setSyllabus(currentSyllabus);
    }
    if (currentSubject && (!subject || subject === 'Computer Science')) {
      setSubject(currentSubject);
    }
  }, [currentSubject, currentSyllabus]);

  const handleGenerate = async () => {
    if (!syllabus.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await geminiClient.generateStudyPlan({
        subject,
        syllabusOrTopics: syllabus,
        daysUntilExam: days,
        dailyAvailableHours: dailyHours,
        targetScore,
        currentMasteryLevel: masteryLevel,
      });
      setPlan(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate study timetable.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyTimetable = () => {
    if (!plan) return;
    const text = `=== ${plan.planTitle} ===\nMethodology: ${plan.recommendedMethodology}\nOverview: ${plan.overview}\nTotal Study Hours: ${plan.totalStudyHours} hrs\n\n` +
      plan.dailySchedule
        .map(
          (d) =>
            `--- ${d.dateLabel}: ${d.focusTheme} ---\nGoal: ${d.milestoneGoal}\n` +
            d.timeSlots.map((ts) => `  [${ts.time}] (${ts.technique}) ${ts.activity} -> Deliverable: ${ts.deliverable}`).join('\n')
        )
        .join('\n\n') +
      `\n\nEXAM EVE CHECKLIST:\n${plan.examEveChecklist.map((c) => `✓ ${c}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
      {/* Left Form: Syllabus & Parameters (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Study Plan Generator</h2>
              <p className="text-[11px] text-slate-400">Algorithmic revision schedule with spaced retrieval</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Subject / Exam Name</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Advanced Operating Systems, Biochem Finals..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Syllabus Outline & Modules</label>
              <button
                onClick={() => setSyllabus(currentSyllabus)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
              >
                Insert Preset Syllabus
              </button>
            </div>
            <textarea
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="List modules, topics, or chapters to cover..."
              rows={5}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
            />
          </div>

          {/* Time & Target Constraints */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Days Until Exam
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value={3}>3 Days (Crash Mode)</option>
                <option value={5}>5 Days (Intensive)</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={21}>21 Days (3 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Daily Study Hours
              </label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value={2}>2 Hours / day</option>
                <option value={4}>4 Hours / day</option>
                <option value={6}>6 Hours / day</option>
                <option value={8}>8 Hours / day</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Target Score
              </label>
              <select
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="90%+ (Distinction)">90%+ (Distinction)</option>
                <option value="80%+ (First Class)">80%+ (First Class)</option>
                <option value="Pass & Master Fundamentals">Pass with Confidence</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Current Level
              </label>
              <select
                value={masteryLevel}
                onChange={(e) => setMasteryLevel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="beginner">Starting Fresh</option>
                <option value="intermediate">Halfway Familiar</option>
                <option value="revision_ready">Revision Ready</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !syllabus.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Optimal Timetable...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Study Schedule</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <strong>Error: </strong> {error}
          </div>
        )}
      </div>

      {/* Right Schedule Output (7 cols) */}
      <div className="lg:col-span-7">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col overflow-hidden">
          {plan ? (
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                    Personalized Revision Roadmap
                  </span>
                  <h3 className="text-xl font-bold text-white">{plan.planTitle}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Total Hours: <strong>{plan.totalStudyHours} hrs</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      Method: <strong>{plan.recommendedMethodology}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={copyTimetable}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 shrink-0 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Export Plan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Strategic Overview */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-indigo-100 leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">Strategic Blueprint:</span>
                {plan.overview}
              </div>

              {/* Day by Day Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-400" /> Daily Time-Blocked Schedule ({plan.dailySchedule.length} Days)
                </h4>

                <div className="space-y-3">
                  {plan.dailySchedule.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-700/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white bg-indigo-600 px-2 py-0.5 rounded text-[11px]">
                            {day.dateLabel}
                          </span>
                          <span className="font-semibold text-indigo-200 text-sm">
                            {day.focusTheme}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-300 font-medium">
                          Target: {day.milestoneGoal}
                        </span>
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-2">
                        {day.timeSlots.map((slot, sIdx) => {
                          const techniqueColor =
                            slot.technique === 'Active Recall'
                              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                              : slot.technique === 'Past Papers'
                              ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
                              : slot.technique === 'Spaced Review'
                              ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                              : 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30';

                          return (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="flex items-start sm:items-center gap-2">
                                <span className="font-mono text-slate-400 text-[11px] w-24 shrink-0">
                                  {slot.time}
                                </span>
                                <span className="text-slate-200 font-medium">{slot.activity}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${techniqueColor}`}>
                                  {slot.technique}
                                </span>
                                {slot.deliverable && (
                                  <span className="text-[11px] text-slate-400 hidden md:inline">
                                    → {slot.deliverable}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Eve Checklist */}
              {plan.examEveChecklist && plan.examEveChecklist.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                  <span className="font-bold text-emerald-300 block flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Exam Eve Protocol & Checklist:
                  </span>
                  <div className="space-y-1.5">
                    {plan.examEveChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-indigo-400 border border-slate-700">
                <Calendar className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                No Plan Generated Yet
              </h3>
              <p className="text-xs max-w-sm text-slate-400 mb-6">
                Enter your exam date, available daily hours, and syllabus on the left to let Gemini calculate your optimal study schedule.
              </p>
              <button
                onClick={handleGenerate}
                disabled={!syllabus.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition"
              >
                Build Plan for {subject}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
