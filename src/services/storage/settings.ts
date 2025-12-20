/**
 * Settings Storage Service - Persistent storage for layout settings and theme
 */

import { load } from "@tauri-apps/plugin-store";
import type { LayoutSettings, ThemeMode } from "../../types/store";

const STORE_FILE = "settings.json";
const LAYOUT_KEY = "layoutSettings";
const THEME_KEY = "theme";

/**
 * Checks if running in Tauri environment.
 */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Loads layout settings from persistent storage.
 * @returns Promise resolving to settings or null if not found
 */
export async function loadLayoutSettings(): Promise<LayoutSettings | null> {
  if (!isTauri()) {
    return null;
  }

  try {
    const store = await load(STORE_FILE);
    const settings = await store.get<LayoutSettings>(LAYOUT_KEY);
    return settings ?? null;
  } catch {
    return null;
  }
}

/**
 * Saves layout settings to persistent storage.
 * @param settings - Layout settings to save
 */
export async function saveLayoutSettings(settings: LayoutSettings): Promise<void> {
  if (!isTauri()) {
    return;
  }

  try {
    const store = await load(STORE_FILE);
    await store.set(LAYOUT_KEY, settings);
    await store.save();
  } catch {
    // Silently handle save errors
  }
}

/**
 * Loads theme preference from persistent storage.
 * @returns Promise resolving to theme or null if not found
 */
export async function loadTheme(): Promise<ThemeMode | null> {
  if (!isTauri()) {
    return null;
  }

  try {
    const store = await load(STORE_FILE);
    const theme = await store.get<ThemeMode>(THEME_KEY);
    return theme ?? null;
  } catch {
    return null;
  }
}

/**
 * Saves theme preference to persistent storage.
 * @param theme - Theme mode to save
 */
export async function saveTheme(theme: ThemeMode): Promise<void> {
  if (!isTauri()) {
    return;
  }

  try {
    const store = await load(STORE_FILE);
    await store.set(THEME_KEY, theme);
    await store.save();
  } catch {
    // Silently handle save errors
  }
}
