import Link from 'next/link';
import { Deck } from '@/lib/types';
import { getDeckStats } from '@/lib/storage';
import ProgressBar from './ProgressBar';

interface DeckCardProps {
  deck: Deck;
  stats: ReturnType<typeof getDeckStats>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DeckCard({ deck, stats }: DeckCardProps) {
  const hasDue = stats.due > 0;

  return (
    <Link
      href={`/deck/${deck.id}`}
      className={`block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border-2 ${
        hasDue ? 'border-indigo-400' : 'border-transparent'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h2 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
          {deck.name}
        </h2>
        {hasDue && (
          <span className="ml-2 shrink-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {stats.due} due
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">Created {formatDate(deck.createdAt)}</p>
      <ProgressBar value={stats.mastered} max={stats.total} label="Mastered" />
      <p className="text-xs text-gray-500 mt-2">
        {stats.mastered}/{stats.total} cards mastered
      </p>
    </Link>
  );
}
