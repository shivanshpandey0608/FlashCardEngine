'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDeckById, getDeckStats, deleteDeck } from '@/lib/storage';
import { Deck, Flashcard } from '@/lib/types';
import StatsPanel from '@/components/StatsPanel';
import ProgressBar from '@/components/ProgressBar';

function dueDateLabel(dueDate: string): string {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Due now';
  if (diffDays === 1) return 'Due today';
  return `Due in ${diffDays} days`;
}

function CardRow({ card }: { card: Flashcard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="text-sm font-medium text-gray-800 line-clamp-2">{card.front}</span>
        <span className="text-xs text-gray-400 ml-4 shrink-0">{dueDateLabel(card.dueDate)}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 mt-2">{card.back}</p>
          {card.hint && (
            <p className="text-xs text-indigo-400 mt-1 italic">Hint: {card.hint}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);

  useEffect(() => {
    setDeck(getDeckById(deckId));
  }, [deckId]);

  if (deck === undefined) return null; // loading

  if (!deck) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Deck not found. It may have been deleted.</p>
        <Link href="/" className="text-indigo-600 hover:underline font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  const stats = getDeckStats(deck);

  function handleDelete() {
    if (!confirm('Delete this deck? This cannot be undone.')) return;
    deleteDeck(deckId);
    router.push('/');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{deck.name}</h1>

      <StatsPanel stats={stats} />

      <div className="mt-6">
        <ProgressBar value={stats.mastered} max={stats.total} label="Mastered" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Link
          href={stats.due > 0 ? `/deck/${deck.id}/practice` : '#'}
          className={`flex-1 text-center font-semibold py-3 rounded-xl transition-colors ${
            stats.due > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
          }`}
          aria-disabled={stats.due === 0}
        >
          Practice ({stats.due} due)
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          Delete
        </button>
      </div>

      {/* Card list */}
      {deck.cards.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Cards ({deck.cards.length})
          </h2>
          <div className="flex flex-col gap-2">
            {deck.cards.map(card => (
              <CardRow key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
