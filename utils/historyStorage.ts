
import type { HistoryEntry } from '../types';

const HISTORY_KEY = 'researchGenHistory';

export function getHistory(): HistoryEntry[] {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      return JSON.parse(storedHistory);
    }
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
  return [];
}

export function saveHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history from localStorage", error);
  }
}
