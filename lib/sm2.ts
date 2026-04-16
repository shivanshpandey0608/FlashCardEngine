import { Flashcard, Rating } from './types';

export function applyRating(card: Flashcard, rating: Rating): Flashcard {
  let { easeFactor, interval, repetitions } = card;

  if (rating < 2) {
    // Failed — reset streak
    repetitions = 0;
    interval = 1;
    // easeFactor unchanged on failure
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    // Update ease factor
    easeFactor = easeFactor + 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02);
    easeFactor = Math.max(1.3, easeFactor);
    repetitions += 1;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    ...card,
    easeFactor: parseFloat(easeFactor.toFixed(4)),
    interval,
    repetitions,
    dueDate: dueDate.toISOString(),
    lastReviewed: new Date().toISOString(),
  };
}

// Builds the practice queue for a session.
// Rules:
// 1. Cards due today come first (sorted by dueDate ascending)
// 2. New cards (repetitions === 0) come next (up to 20 new per session)
// 3. Cards rated "Again" in this session go to the end of the queue (re-shown once)
export function buildQueue(cards: Flashcard[]): string[] {
  const now = new Date();
  const due = cards
    .filter(c => new Date(c.dueDate) <= now && c.repetitions > 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const newCards = cards
    .filter(c => c.repetitions === 0)
    .slice(0, 20);
  return [...due, ...newCards].map(c => c.id);
}
