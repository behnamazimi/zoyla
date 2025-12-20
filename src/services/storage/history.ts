/**
 * History Storage Service - Persistent storage for test history
 */

import { load } from "@tauri-apps/plugin-store";
import type { HistoryEntry } from "../../types/api";

const STORE_FILE = "settings.json";
const HISTORY_KEY = "testHistory";

/**
 * Checks if running in Tauri environment.
 */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Loads test history from persistent storage.
 * @returns Promise resolving to history entries or empty array
 */
export async function loadHistory(): Promise<HistoryEntry[]> {
  if (!isTauri()) {
    return [];
  }

  try {
    const store = await load(STORE_FILE);
    return (await store.get<HistoryEntry[]>(HISTORY_KEY)) ?? [];
  } catch {
    return [];
  }
}

/**
 * Saves test history to persistent storage.
 * @param entries - History entries to save
 */
export async function saveHistory(entries: HistoryEntry[]): Promise<void> {
  if (!isTauri()) {
    return;
  }

  try {
    const store = await load(STORE_FILE);
    await store.set(HISTORY_KEY, entries);
    await store.save();
  } catch {
    // Silently handle save errors
  }
}
