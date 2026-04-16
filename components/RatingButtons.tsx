'use client';

import { useEffect } from 'react';
import { Rating } from '@/lib/types';

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  isLoading?: boolean;
}

const BUTTONS: { label: string; rating: Rating; color: string; key: string }[] = [
  { label: 'Again', rating: 0, color: 'bg-red-500 hover:bg-red-600', key: '1' },
  { label: 'Hard',  rating: 1, color: 'bg-orange-500 hover:bg-orange-600', key: '2' },
  { label: 'Good',  rating: 2, color: 'bg-green-500 hover:bg-green-600', key: '3' },
  { label: 'Easy',  rating: 3, color: 'bg-blue-500 hover:bg-blue-600', key: '4' },
];

export default function RatingButtons({ onRate, isLoading }: RatingButtonsProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (isLoading) return;
      const btn = BUTTONS.find(b => b.key === e.key);
      if (btn) onRate(btn.rating);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRate, isLoading]);

  return (
    <div className="grid grid-cols-4 gap-3">
      {BUTTONS.map(b => (
        <button
          key={b.label}
          disabled={isLoading}
          onClick={() => onRate(b.rating)}
          className={`
            ${b.color} text-white font-semibold py-3 rounded-xl
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex flex-col items-center gap-1
          `}
        >
          <span>{b.label}</span>
          <span className="text-xs opacity-70">[{b.key}]</span>
        </button>
      ))}
    </div>
  );
}
