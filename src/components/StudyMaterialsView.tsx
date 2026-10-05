import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  FileText,
  UploadCloud,
  MessageSquare,
  HelpCircle,
  Layers,
  FileQuestion,
  Mic,
  Clock,
  Trash2,
  Check,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { ActiveTab, StudyMaterial } from '../types/index.ts';

interface StudyMaterialsViewProps {
  materials: StudyMaterial[];
  selectedMaterial: StudyMaterial | null;
  onSelectMaterial: (m: StudyMaterial) => void;
  onAddMaterial: (m: StudyMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onActionWithMaterial: (material: StudyMaterial, targetTab: ActiveTab) => void;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  materials,
  selectedMaterial,
  onSelectMaterial,
  onAddMaterial,
  onDeleteMaterial,
  onActionWithMaterial,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNewContent(text);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const wordCount = newContent.trim().split(/\s+/).length;
    const readingMinutes = Math.max(1, Math.round(wordCount / 180));

    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject.trim() || 'General Academics',
      content: newContent.trim(),
      sourceType: 'upload',
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      wordCount,
      readingMinutes,
    };

    onAddMaterial(newMat);
    onSelectMaterial(newMat);
    setNewTitle('');
    setNewSubject('');
    setNewContent('');
    setShowAddModal(false);
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Study Materials Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload notes, lecture slides, or textbooks to ground quizzes, flashcards, and AI tutor explanations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Material</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search documents by subject, title, or keyword..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Materials List & Active Document Detail */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Documents ({filteredMaterials.length})
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
              No study materials found. Click "Add Study Material" above to upload or paste your notes.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMaterials.map((mat) => {
                const isSelected = selectedMaterial?.id === mat.id;
                return (
                  <div
                    key={mat.id}
                    onClick={() => onSelectMaterial(mat)}
                    className={`p-3.5 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-500/20'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">
                          {mat.subject}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {mat.title}
                        </h3>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 mt-2 border-t border-slate-100">
                      <span>{mat.dateAdded}</span>
                      <span>{mat.wordCount} words</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Active Preview & Actions (7 cols) */}
        <div className="md:col-span-7">
          {selectedMaterial ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              {/* Document Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {selectedMaterial.subject}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedMaterial.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{selectedMaterial.wordCount} words</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{selectedMaterial.readingMinutes} min read
                    </span>
                    <span>•</span>
                    <span>Added {selectedMaterial.dateAdded}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMaterial(selectedMaterial.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons Hub: Ask Tutor, Summarize, Quiz, Flashcards, Exam Qs */}
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  Launch Study Tool with this Material:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => onActionWithMaterial(selectedMaterial, 'tutor')}
                    className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Ask Tutor AI</span>
                  </button>

                  <button
                    onClick={() => onActionWithMaterial(selectedMaterial, 'summarizer')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Summarize Notes</span>
                  </button>

                  <button
                    onClick={() => onActionWithMaterial(selectedMaterial, 'quiz')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Generate Quiz</span>
                  </button>

                  <button
                    onClick={() => onActionWithMaterial(selectedMaterial, 'flashcards')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Flashcards</span>
                  </button>

                  <button
                    onClick={() => onActionWithMaterial(selectedMaterial, 'important_questions')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                  >
                    <FileQuestion className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>High-Yield Qs</span>
                  </button>

                  <button
                    onClick={() => onActionWithMaterial(selectedMaterial, 'viva')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Viva Voce Exam</span>
                  </button>
                </div>
              </div>

              {/* Document Text Preview */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-slate-500 block">Document Preview</span>
                <div className="max-h-[340px] overflow-y-auto bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedMaterial.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">Select a study material on the left or add a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Study Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Study Material</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Document Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Chapter 4: Photosynthesis"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Biology, CS, Physics"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Upload file trigger */}
              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                <label className="cursor-pointer flex flex-col items-center gap-1 text-slate-600 hover:text-indigo-600">
                  <UploadCloud className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-xs">Upload .txt or text file</span>
                  <span className="text-[10px] text-slate-400">or paste notes below</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Content / Notes</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste lecture notes, textbook excerpts, or revision summaries..."
                  rows={8}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-semibold transition"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
