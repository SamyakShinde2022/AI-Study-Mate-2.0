import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Compass,
  Check,
  Copy,
} from 'lucide-react';
import { StudyPlanResult, StudyTask } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface StudyPlanViewProps {
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: StudyTask) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
}) => {
  const [subject, setSubject] = useState('Computer Science');
  const [examDate, setExamDate] = useState('7 days');
  const [dailyHours, setDailyHours] = useState(4);
  const [syllabus, setSyllabus] = useState('Recursion, Binary Search Trees, Graph Traversals, Sorting Algorithms');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanResult | null>(null);

  // New task inline state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('30 min');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [showAddTask, setShowAddTask] = useState(false);

  const handleGenerate = async () => {
    if (!syllabus.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    const daysNum = parseInt(examDate, 10) || 7;

    try {
      const res = await geminiClient.generateStudyPlan({
        subject,
        syllabusOrTopics: syllabus,
        daysUntilExam: daysNum,
        dailyAvailableHours: dailyHours,
        targetScore: '90%+',
        currentMasteryLevel: 'intermediate',
      });
      setGeneratedPlan(res);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject.trim() || subject,
      duration: newTaskDuration,
      priority: newTaskPriority,
      completed: false,
      category: 'Practice',
    });

    setNewTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* 1. Today Section */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Schedule</h2>
            <p className="text-xs text-slate-500">
              Check off tasks as you finish your study sessions.
            </p>
          </div>

          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Inline Add Task Form */}
        {showAddTask && (
          <form onSubmit={handleCreateTask} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task description..."
                required
                className="bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
              />
              <input
                type="text"
                value={newTaskSubject}
                onChange={(e) => setNewTaskSubject(e.target.value)}
                placeholder="Subject (e.g. Physics)"
                className="bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  placeholder="30 min"
                  className="bg-white border border-slate-200 rounded-lg p-2 text-slate-800 w-24"
                />
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Task List (Clean table/rows) */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition cursor-pointer ${
                task.completed
                  ? 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(task.id);
                  }}
                  className="text-indigo-600 focus:outline-none"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div>
                  <span
                    className={`font-semibold block ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="text-[11px] text-slate-400">{task.subject}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {task.duration}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    task.priority === 'high'
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : task.priority === 'medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Generate Plan with Gemini Section */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Generate AI Study Schedule
          </h2>
          <p className="text-xs text-slate-500">
            Let Gemini compute a personalized revision roadmap based on your exam date and syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">Exam In</label>
            <select
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="3 days">3 Days</option>
              <option value="7 days">7 Days (1 Week)</option>
              <option value="14 days">14 Days (2 Weeks)</option>
              <option value="30 days">30 Days (1 Month)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">Daily Study Hours</label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value={2}>2 Hours / day</option>
              <option value={4}>4 Hours / day</option>
              <option value={6}>6 Hours / day</option>
            </select>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-medium text-slate-700">Syllabus Outline & Key Topics</label>
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={3}
            placeholder="Enter key topics to cover..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !syllabus.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Computing Timetable...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Study Plan</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}
      </section>

      {/* 3. Generated Schedule Days */}
      {generatedPlan && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">{generatedPlan.planTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{generatedPlan.overview}</p>
          </div>

          <div className="space-y-3">
            {generatedPlan.dailySchedule.map((day) => (
              <div
                key={day.dayNumber}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white bg-indigo-600 px-2 py-0.5 rounded text-[11px]">
                      {day.dateLabel}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {day.focusTheme}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">Goal: {day.milestoneGoal}</span>
                </div>

                <div className="space-y-1.5">
                  {day.timeSlots.map((slot, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2 rounded-lg bg-white border border-slate-200/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[11px] w-24">
                          {slot.time}
                        </span>
                        <span className="text-slate-800 font-medium">{slot.activity}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {slot.technique}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
