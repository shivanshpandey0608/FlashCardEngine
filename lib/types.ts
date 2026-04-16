// Every flashcard
export interface Flashcard {
  id: string;                  // uuid v4
  front: string;               // Question / term (max 300 chars)
  back: string;                // Answer / explanation (max 600 chars)
  hint?: string;               // Optional one-line hint
  // SM-2 fields
  easeFactor: number;          // Starts at 2.5, min 1.3
  interval: number;            // Days until next review. Starts at 0
  repetitions: number;         // Times answered correctly in a row
  dueDate: string;             // ISO date string — when card is next due
  lastReviewed: string | null; // ISO date string or null
}

// A deck = one PDF's worth of cards
export interface Deck {
  id: string;                  // uuid v4
  name: string;                // Derived from PDF filename (strip .pdf, max 60 chars)
  createdAt: string;           // ISO datetime
  cards: Flashcard[];
}

// What the API route returns
export interface GenerateResponse {
  cards: Array<{
    front: string;
    back: string;
    hint?: string;
  }>;
}

// SM-2 rating scale
export type Rating = 0 | 1 | 2 | 3;
// 0 = Again (complete blackout)
// 1 = Hard (significant difficulty)
// 2 = Good (correct with effort)
// 3 = Easy (perfect recall)

// Practice session state (in-memory only, not persisted)
export interface PracticeSession {
  deckId: string;
  queue: string[];             // Ordered array of card IDs to show
  currentIndex: number;
  isFlipped: boolean;
  sessionStartedAt: string;
  reviewedThisSession: number;
}
