import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { Flashcard, FlashcardDeck, StudyMaterial } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface FlashcardsViewProps {
  activeMaterial: StudyMaterial | null;
  onCardStatusChange?: (mastered: number, needsReview: number) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  activeMaterial,
  onCardStatusChange,
}) => {
  const [topicInput, setTopicInput] = useState(activeMaterial?.title || 'Data Structures & Algorithms');
  const [count, setCount] = useState<number>(8);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<number, 'known' | 'difficult'>>({});

  React.useEffect(() => {
    if (activeMaterial && (!topicInput || topicInput === 'Data Structures & Algorithms')) {
      setTopicInput(activeMaterial.title);
    }
  }, [activeMaterial]);

  const handleGenerate = async () => {
    const query = topicInput.trim() || activeMaterial?.content || 'Computer Science';
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardStatus({});

    try {
      const res = await geminiClient.generateFlashcards({
        topicOrContent: activeMaterial ? `${activeMaterial.title}\n${activeMaterial.content}` : query,
        count,
        focus: 'all',
      });
      setDeck(res);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to StudyMate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const markCard = (status: 'known' | 'difficult') => {
    const nextStatus = { ...cardStatus, [currentIndex]: status };
    setCardStatus(nextStatus);

    const knownCount = Object.values(nextStatus).filter((s) => s === 'known').length;
    const diffCount = Object.values(nextStatus).filter((s) => s === 'difficult').length;
    if (onCardStatusChange) {
      onCardStatusChange(knownCount, diffCount);
    }

    // Advance to next card if not at end
    if (deck && currentIndex < deck.cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentCard: Flashcard | undefined = deck?.cards[currentIndex];
  const totalCards = deck?.cards.length || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      {/* Top Generator Input */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-700">Flashcard Topic or Subject</label>
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Physics: Thermodynamics, Molecular Genetics, OSI Layers..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-600"
          >
            <option value={6}>6 Cards</option>
            <option value={8}>8 Cards</option>
            <option value={12}>12 Cards</option>
            <option value={16}>16 Cards</option>
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
                <span>Create Deck</span>
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

      {/* Centered Large Flashcard */}
      {deck && currentCard && totalCards > 0 && (
        <div className="space-y-4">
          {/* Card Count Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              Card {currentIndex + 1} / {totalCards}
            </span>
            <span className="text-slate-400 capitalize">
              {currentCard.category}
            </span>
          </div>

          {/* Large Card Centered on Screen */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl min-h-[300px] sm:min-h-[340px] p-8 shadow-xs hover:shadow-sm transition cursor-pointer select-none flex flex-col justify-between"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-[11px] uppercase tracking-wider text-indigo-600">
                {isFlipped ? 'Answer' : 'Question'}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <RotateCw className="w-3 h-3 text-slate-400" />
                Click to flip
              </span>
            </div>

            {/* Main Content */}
            <div className="my-auto py-6 text-center">
              <div
                className={`transition-all leading-relaxed ${
                  isFlipped
                    ? 'text-sm sm:text-base text-slate-800 font-normal'
                    : 'text-base sm:text-lg text-slate-900 font-semibold'
                }`}
              >
                {isFlipped ? currentCard.back : currentCard.front}
              </div>

              {/* Memory hint on back */}
              {isFlipped && currentCard.mnemonicOrHint && (
                <div className="mt-4 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-900 text-xs inline-flex items-center gap-1.5 text-left">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Hint:</strong> {currentCard.mnemonicOrHint}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom State */}
            <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
              Status:{' '}
              <strong
                className={
                  cardStatus[currentIndex] === 'known'
                    ? 'text-emerald-600'
                    : cardStatus[currentIndex] === 'difficult'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }
              >
                {cardStatus[currentIndex] === 'known'
                  ? 'Known'
                  : cardStatus[currentIndex] === 'difficult'
                  ? 'Difficult'
                  : 'Unrated'}
              </strong>
            </div>
          </div>

          {/* Minimal Navigation & Rating Buttons: Previous, Difficult, Known, Next */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex((p) => Math.max(0, p - 1));
              }}
              disabled={currentIndex === 0}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => markCard('difficult')}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Difficult</span>
              </button>

              <button
                onClick={() => markCard('known')}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Known</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex((p) => Math.min(totalCards - 1, p + 1));
              }}
              disabled={currentIndex === totalCards - 1}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!deck && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">Minimal Flashcards</h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400">
            Enter any topic above or click "Create Deck" to test your active recall with clean, tap-to-flip cards.
          </p>
        </div>
      )}
    </div>
  );
};
