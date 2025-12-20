/**
 * UI Store - Manages UI preferences and panel visibility
 * Independent store with no cross-store dependencies.
 */

import { create } from "zustand";
import type { UIState, UIActions, LayoutSettings, ThemeMode } from "../types/store";
import { DEFAULT_LAYOUT_SETTINGS, DEFAULT_SIDEBAR_WIDTH } from "../constants/defaults";
import { loadLayoutSettings, saveLayoutSettings, loadTheme, saveTheme } from "../services/storage";

type UIStore = UIState & UIActions;

/**
 * Apply theme to the document root element
 */
function applyTheme(theme: ThemeMode) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

/**
 * Zustand store for UI state.
 * Manages sidebar width, panel visibility, and layout settings.
 */
export const useUIStore = create<UIStore>()((set, get) => ({
  // Initial state
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  showHistory: false,
  showLayoutSettings: false,
  showHeaders: false,
  showErrorLogs: false,
  showKeyboardGuide: false,
  layoutSettings: DEFAULT_LAYOUT_SETTINGS,
  theme: "dark",

  // Actions
  setSidebarWidth: (sidebarWidth: number) => set({ sidebarWidth }),

  setShowHistory: (showHistory: boolean) =>
    set({
      showHistory,
      showLayoutSettings: showHistory ? false : get().showLayoutSettings,
    }),

  setShowLayoutSettings: (showLayoutSettings: boolean) =>
    set({
      showLayoutSettings,
      showHistory: showLayoutSettings ? false : get().showHistory,
    }),

  setShowHeaders: (showHeaders: boolean) => set({ showHeaders }),

  setShowErrorLogs: (showErrorLogs: boolean) => set({ showErrorLogs }),

  setShowKeyboardGuide: (showKeyboardGuide: boolean) => set({ showKeyboardGuide }),

  updateLayoutSettings: (updates: Partial<LayoutSettings>) => {
    const newSettings = { ...get().layoutSettings, ...updates };
    set({ layoutSettings: newSettings });
    // Persist to storage (fire and forget)
    saveLayoutSettings(newSettings);
  },

  setTheme: (theme: ThemeMode) => {
    applyTheme(theme);
    set({ theme });
    // Persist to storage (fire and forget)
    saveTheme(theme);
  },

  loadFromStorage: async () => {
    const settings = await loadLayoutSettings();
    if (settings) {
      set({ layoutSettings: settings });
    }
    const theme = await loadTheme();
    if (theme) {
      applyTheme(theme);
      set({ theme });
    }
  },
}));
