import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  RefreshCw,
  RotateCw,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
  List,
  CreditCard,
} from 'lucide-react';
import { Flashcard, FlashcardDeck } from '../types/index.ts';
import { geminiClient } from '../services/geminiClient.ts';

interface FlashcardsViewProps {
  currentTopic: string;
  currentNotes: string;
  onCardStatusChange?: (mastered: number, needsReview: number) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  currentTopic,
  currentNotes,
  onCardStatusChange,
}) => {
  const [topicInput, setTopicInput] = useState(currentTopic || '');
  const [count, setCount] = useState<number>(8);
  const [focus, setFocus] = useState<'definitions' | 'formulas' | 'conceptual' | 'all'>('all');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);

  // Card view state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<number, 'mastered' | 'review'>>({});
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');

  React.useEffect(() => {
    if (currentTopic && (!topicInput || topicInput === '')) {
      setTopicInput(currentTopic);
    }
  }, [currentTopic]);

  const handleGenerate = async () => {
    const query = topicInput.trim() || currentNotes.trim() || 'Core Science';
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardStatus({});

    try {
      const res = await geminiClient.generateFlashcards({
        topicOrContent: query,
        count,
        focus,
      });
      setDeck(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const markCard = (status: 'mastered' | 'review') => {
    if (!deck) return;
    const newStatus = {
      ...cardStatus,
      [currentIndex]: status,
    };
    setCardStatus(newStatus);

    const masteredCount = Object.values(newStatus).filter((s) => s === 'mastered').length;
    const reviewCount = Object.values(newStatus).filter((s) => s === 'review').length;
    if (onCardStatusChange) {
      onCardStatusChange(masteredCount, reviewCount);
    }

    // Auto advance to next card
    if (currentIndex < deck.cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((p) => p + 1);
    }
  };

  const shuffleDeck = () => {
    if (!deck) return;
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck({
      ...deck,
      cards: shuffled,
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard: Flashcard | undefined = deck?.cards[currentIndex];
  const totalCards = deck?.cards.length || 0;
  const masteredTotal = Object.values(cardStatus).filter((s) => s === 'mastered').length;
  const reviewTotal = Object.values(cardStatus).filter((s) => s === 'review').length;

  return (
    <div className="space-y-6">
      {/* Top Generator Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Flashcard Topic or Subject
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Molecular Genetics, Sorting Algorithms, Thermodynamics Laws..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Deck Size</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value={6}>6 Cards</option>
                <option value={8}>8 Cards</option>
                <option value={12}>12 Cards</option>
                <option value={16}>16 Cards</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Focus</label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Balanced Overview</option>
                <option value="definitions">Core Definitions</option>
                <option value="formulas">Formulas & Equations</option>
                <option value="conceptual">Conceptual Mechanisms</option>
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
                  <span>Generating Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Flashcards</span>
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

      {/* Main Flashcard Interactive Area */}
      {deck && totalCards > 0 ? (
        <div className="space-y-4">
          {/* Deck Stats & View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">{deck.deckTitle}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                Card {currentIndex + 1} of {totalCards}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-medium">
                  ✓ {masteredTotal} Mastered
                </span>
                <span className="text-amber-400 font-medium">
                  ↺ {reviewTotal} Needs Review
                </span>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
                <button
                  onClick={shuffleDeck}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Shuffle deck"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'card' ? 'grid' : 'card')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title={viewMode === 'card' ? 'Grid view' : 'Single card view'}
                >
                  {viewMode === 'card' ? <List className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'card' && currentCard ? (
            /* 3D Flip Card View */
            <div className="max-w-2xl mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer select-none perspective-[1200px]"
              >
                <div
                  className={`min-h-[300px] sm:min-h-[340px] rounded-3xl p-8 border transition-all duration-500 shadow-2xl relative flex flex-col justify-between ${
                    isFlipped
                      ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/50 shadow-indigo-500/10'
                      : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Top Bar on Card */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-medium">
                      {currentCard.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 capitalize">
                        {currentCard.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <RotateCw className="w-3 h-3 text-indigo-400" />
                        <span>Click to flip</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content (Front / Back) */}
                  <div className="my-auto py-6 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                      {isFlipped ? 'ANSWER / MECHANISM' : 'QUESTION / PROMPT'}
                    </span>
                    <div
                      className={`font-medium transition-all ${
                        isFlipped
                          ? 'text-base sm:text-lg text-emerald-200 leading-relaxed text-left sm:text-center'
                          : 'text-lg sm:text-xl text-white leading-relaxed font-semibold'
                      }`}
                    >
                      {isFlipped ? currentCard.back : currentCard.front}
                    </div>

                    {/* Mnemonic / Memory Hint */}
                    {isFlipped && currentCard.mnemonicOrHint && (
                      <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs inline-flex items-center gap-2 text-left">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong className="text-amber-300">Mnemonic / Hint:</strong>{' '}
                          {currentCard.mnemonicOrHint}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Indicator on Card */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                    <span>Active Recall Mode</span>
                    <span>
                      Status:{' '}
                      <strong
                        className={
                          cardStatus[currentIndex] === 'mastered'
                            ? 'text-emerald-400'
                            : cardStatus[currentIndex] === 'review'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }
                      >
                        {cardStatus[currentIndex] || 'Unrated'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation & Spaced Repetition Rating Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((p) => Math.max(p - 1, 0));
                  }}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markCard('review')}
                    className="px-4 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/40 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Need Review</span>
                  </button>
                  <button
                    onClick={() => markCard('mastered')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mastered!</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((p) => Math.min(p + 1, totalCards - 1));
                  }}
                  disabled={currentIndex === totalCards - 1}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Grid Deck Overview */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deck.cards.map((card, idx) => {
                const status = cardStatus[idx];
                return (
                  <div
                    key={card.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase">
                          {card.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            status === 'mastered'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : status === 'review'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {status || 'Unrated'}
                        </span>
                      </div>
                      <div className="font-semibold text-white text-sm mb-2">{card.front}</div>
                      <div className="text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
                        {card.back}
                      </div>
                    </div>

                    {card.mnemonicOrHint && (
                      <div className="text-[11px] text-amber-300/80 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                        💡 {card.mnemonicOrHint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-slate-700">
            <Layers className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Active Recall Flashcards
          </h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400 mb-6">
            Generate high-retention spaced repetition flashcards with definitions, mnemonic tricks, and active flip testing.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Create Flashcards for {topicInput || currentTopic}
          </button>
        </div>
      )}
    </div>
  );
};
