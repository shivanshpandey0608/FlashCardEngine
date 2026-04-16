'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllDecks, getDeckStats } from '@/lib/storage';
import { Deck } from '@/lib/types';
import DeckCard from '@/components/DeckCard';
import EmptyState from '@/components/EmptyState';

export default function HomePage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      setDecks(getAllDecks());
    } catch {
      setStorageError(true);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flashcard Engine</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered spaced repetition</p>
        </div>
        <Link
          href="/upload"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          + New Deck
        </Link>
      </header>

      {storageError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-6 text-sm">
          Storage unavailable — try disabling private browsing.
        </div>
      )}

      {decks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map(deck => (
            <DeckCard key={deck.id} deck={deck} stats={getDeckStats(deck)} />
          ))}
        </div>
      )}
    </div>
  );
}
