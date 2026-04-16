'use client';

import { Flashcard } from '@/lib/types';

interface FlashCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div
      className="card-container w-full h-60 md:h-72 cursor-pointer"
      onClick={isFlipped ? undefined : onFlip}
      role="button"
      tabIndex={isFlipped ? -1 : 0}
      aria-label={`Flashcard: ${card.front}. Press Space to flip.`}
      onKeyDown={e => {
        if (!isFlipped && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="card-face bg-white rounded-2xl shadow-md flex items-center justify-center p-8">
          <p className="text-xl md:text-2xl font-medium text-gray-800 text-center leading-relaxed">
            {card.front}
          </p>
        </div>

        {/* Back */}
        <div className="card-face card-back-face bg-indigo-50 rounded-2xl shadow-md flex flex-col items-center justify-between p-8">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg md:text-xl text-gray-800 text-center leading-relaxed">
              {card.back}
            </p>
          </div>
          {card.hint && (
            <p className="text-sm text-indigo-400 mt-4 text-center italic">
              Hint: {card.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
