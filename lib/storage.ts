import { Deck, Flashcard } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'fc_decks';

// Returns all decks. Returns [] if nothing in storage or parse fails.
export function getAllDecks(): Deck[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Deck[];
  } catch {
    return [];
  }
}

// Returns one deck by id. Returns null if not found.
export function getDeckById(deckId: string): Deck | null {
  return getAllDecks().find(d => d.id === deckId) ?? null;
}

// Saves a new deck. Prepends to list (newest first).
export function saveDeck(deck: Deck): Deck {
  const decks = getAllDecks();
  const updated = [deck, ...decks];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return deck;
}

// Creates a new deck from raw card data returned by AI.
// Initialises all SM-2 fields to defaults.
export function createDeck(
  name: string,
  rawCards: Array<{ front: string; back: string; hint?: string }>
): Deck {
  const now = new Date().toISOString();
  const cards: Flashcard[] = rawCards.map(c => ({
    id: uuidv4(),
    front: c.front.slice(0, 300),
    back: c.back.slice(0, 600),
    hint: c.hint?.slice(0, 150),
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: now,       // Due immediately — show all cards in first session
    lastReviewed: null,
  }));
  return {
    id: uuidv4(),
    name: name.replace(/\.pdf$/i, '').slice(0, 60),
    createdAt: now,
    cards,
  };
}

// Updates a single card inside a deck after a review.
export function updateCard(deckId: string, updatedCard: Flashcard): void {
  const decks = getAllDecks();
  const deckIndex = decks.findIndex(d => d.id === deckId);
  if (deckIndex === -1) return;
  const cardIndex = decks[deckIndex].cards.findIndex(c => c.id === updatedCard.id);
  if (cardIndex === -1) return;
  decks[deckIndex].cards[cardIndex] = updatedCard;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

// Deletes a deck by id.
export function deleteDeck(deckId: string): void {
  const decks = getAllDecks().filter(d => d.id !== deckId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

// Computed helpers (do not persist these)
export function getDueCards(deck: Deck): Flashcard[] {
  const now = new Date();
  return deck.cards.filter(c => new Date(c.dueDate) <= now);
}

export function getMasteredCards(deck: Deck): Flashcard[] {
  return deck.cards.filter(c => c.interval >= 21);
}

export function getDeckStats(deck: Deck) {
  return {
    total: deck.cards.length,
    due: getDueCards(deck).length,
    mastered: getMasteredCards(deck).length,
    learning: deck.cards.filter(c => c.repetitions > 0 && c.interval < 21).length,
    new: deck.cards.filter(c => c.repetitions === 0).length,
  };
}
