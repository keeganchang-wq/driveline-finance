import type { SavedQuote } from "./types";

const STORAGE_KEY = "driveline.savedQuotes";

// Local-only for now. Swap this module's implementation for Supabase calls later —
// callers only depend on load/save/remove, not on localStorage.
export function loadSavedQuotes(): SavedQuote[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function persistSavedQuotes(quotes: SavedQuote[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

export function removeSavedQuote(quotes: SavedQuote[], id: number): SavedQuote[] {
  const next = quotes.filter((q) => q.id !== id);
  persistSavedQuotes(next);
  return next;
}
