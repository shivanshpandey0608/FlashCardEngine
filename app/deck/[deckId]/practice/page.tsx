'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDeckById, getDeckStats, updateCard } from '@/lib/storage';
import { applyRating, buildQueue } from '@/lib/sm2';
import { Deck, Flashcard, Rating } from '@/lib/types';
import FlashCard from '@/components/FlashCard';
import RatingButtons from '@/components/RatingButtons';

function SessionComplete({
  reviewed,
  deck,
  onBack,
  onPracticeAgain,
}: {
  reviewed: number;
  deck: Deck;
  onBack: () => void;
  onPracticeAgain: () => void;
}) {
  const stats = getDeckStats(deck);
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="text-6xl" aria-hidden="true">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900">Session complete!</h2>
      <p className="text-gray-500">You reviewed {reviewed} card{reviewed !== 1 ? 's' : ''}</p>
      <div className="flex gap-6 text-sm mt-2">
        <span className="text-green-600 font-medium">{stats.mastered} mastered</span>
        <span className="text-orange-500 font-medium">{stats.learning} still learning</span>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Back to Deck
        </button>
        <button
          onClick={onPracticeAgain}
          className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Practice Again
        </button>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);
  // Single flat queue — "Again" cards get appended to the end
  const [activeQueue, setActiveQueue] = useState<string[]>([]);
  // How many cards were in the original queue (for progress display)
  const [originalQueueLength, setOriginalQueueLength] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [isRating, setIsRating] = useState(false);

  const deckRef = useRef<Deck | null>(null);

  function loadDeck() {
    const d = getDeckById(deckId);
    setDeck(d);
    deckRef.current = d;
    if (d) {
      const q = buildQueue(d.cards);
      setActiveQueue(q);
      setOriginalQueueLength(q.length);
      setCurrentIndex(0);
      setIsFlipped(false);
      setReviewedCount(0);
      setSessionDone(false);
    }
  }

  useEffect(() => {
    loadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  if (deck === undefined) return null;

  if (!deck) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Deck not found.</p>
        <Link href="/" className="text-indigo-600 hover:underline font-medium">Back to Home</Link>
      </div>
    );
  }

  if (activeQueue.length === 0 && !sessionDone) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">✅</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Nothing due today!</h2>
        <p className="text-gray-500 mb-6">Come back tomorrow to keep your streak going.</p>
        <Link
          href={`/deck/${deckId}`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Back to Deck
        </Link>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <SessionComplete
          reviewed={reviewedCount}
          deck={deckRef.current!}
          onBack={() => router.push(`/deck/${deckId}`)}
          onPracticeAgain={loadDeck}
        />
      </div>
    );
  }

  const currentCardId = activeQueue[currentIndex];
  const currentCard: Flashcard | undefined = deck.cards.find(c => c.id === currentCardId);

  // Progress shows position within the original queue (capped), not counting re-queued Again cards
  const displayIndex = Math.min(currentIndex + 1, originalQueueLength);
  const progressPct = (currentIndex / Math.max(activeQueue.length, 1)) * 100;

  function handleFlip() {
    setIsFlipped(true);
  }

  function handleRating(rating: Rating) {
    if (!currentCard || isRating) return;
    setIsRating(true);

    const updated = applyRating(currentCard, rating);
    updateCard(deckId, updated);

    // Keep deckRef in sync for SessionComplete stats
    if (deckRef.current) {
      const idx = deckRef.current.cards.findIndex(c => c.id === updated.id);
      if (idx !== -1) {
        deckRef.current = {
          ...deckRef.current,
          cards: [
            ...deckRef.current.cards.slice(0, idx),
            updated,
            ...deckRef.current.cards.slice(idx + 1),
          ],
        };
      }
    }

    const nextIndex = currentIndex + 1;

    if (rating === 0) {
      // Append to end of queue so card is shown again later
      setActiveQueue(q => [...q, currentCard.id]);
    }

    setReviewedCount(c => c + 1);

    // Check if done: nextIndex reaches the end of the (possibly extended) queue
    // We must check after potentially appending, so read activeQueue length + 1 if Again
    const newQueueLength = activeQueue.length + (rating === 0 ? 1 : 0);
    if (nextIndex >= newQueueLength) {
      setSessionDone(true);
    } else {
      setCurrentIndex(nextIndex);
      setIsFlipped(false);
    }

    setIsRating(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/deck/${deckId}`} className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
          ← Back
        </Link>
        <span className="text-sm text-gray-500 font-medium">
          Card {displayIndex} of {originalQueueLength}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {currentCard && (
        <>
          <FlashCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />

          <div className="mt-6">
            {isFlipped ? (
              <RatingButtons onRate={handleRating} isLoading={isRating} />
            ) : (
              <button
                onClick={handleFlip}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Show Answer
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
