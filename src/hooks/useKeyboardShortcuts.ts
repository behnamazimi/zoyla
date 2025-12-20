/**
 * useKeyboardShortcuts - Global keyboard shortcuts handler
 * Coordinates actions across stores based on key combinations.
 */

import { useEffect, useCallback } from "react";
import { useTestConfigStore, useTestRunnerStore, useHistoryStore, useUIStore } from "../store";
import { exportAsJson, exportAsCsv } from "../services/export";
import { useTestRunner } from "./useTestRunner";

/** URL input element ID for focus shortcut */
const URL_INPUT_ID = "url-input";

/**
 * Hook that registers global keyboard shortcuts.
 * Should be called once at the app root level.
 */
export function useKeyboardShortcuts() {
  const { runTest, cancelTest } = useTestRunner();

  // Test config store
  const resetToDefaults = useTestConfigStore((s) => s.resetToDefaults);
  const { url, method, numRequests, useHttp2 } = useTestConfigStore();

  // Test runner store
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const stats = useTestRunnerStore((s) => s.stats);
  const clearResults = useTestRunnerStore((s) => s.clearResults);

  // History store
  const selectEntry = useHistoryStore((s) => s.selectEntry);

  // UI store
  const {
    showHistory,
    setShowHistory,
    showLayoutSettings,
    setShowLayoutSettings,
    showKeyboardGuide,
    setShowKeyboardGuide,
  } = useUIStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Escape - Close any open popover
      if (e.key === "Escape") {
        if (showHistory) {
          setShowHistory(false);
          e.preventDefault();
          return;
        }
        if (showLayoutSettings) {
          setShowLayoutSettings(false);
          e.preventDefault();
          return;
        }
        if (showKeyboardGuide) {
          setShowKeyboardGuide(false);
          e.preventDefault();
          return;
        }
        return;
      }

      // All other shortcuts require modifier key
      if (!isMod) return;

      switch (e.key.toLowerCase()) {
        // Cmd/Ctrl + Enter - Run/Stop Test
        case "enter":
          e.preventDefault();
          if (isRunning) {
            cancelTest();
          } else {
            runTest();
          }
          break;

        // Cmd/Ctrl + N - New Form (reset config)
        case "n":
          e.preventDefault();
          resetToDefaults();
          clearResults();
          selectEntry(null);
          // Focus URL input after reset
          setTimeout(() => {
            const urlInput = document.getElementById(URL_INPUT_ID);
            if (urlInput) urlInput.focus();
          }, 50);
          break;

        // Cmd/Ctrl + H - Toggle History Panel
        case "h":
          e.preventDefault();
          setShowHistory(!showHistory);
          break;

        // Cmd/Ctrl + , - Toggle Layout Settings
        case ",":
          e.preventDefault();
          setShowLayoutSettings(!showLayoutSettings);
          break;

        // Cmd/Ctrl + E - Export JSON, Cmd/Ctrl + Shift + E - Export CSV
        case "e":
          if (stats && !isRunning) {
            e.preventDefault();
            if (isShift) {
              exportAsCsv(stats, { url, method, numRequests });
            } else {
              exportAsJson(stats, { url, method, numRequests, useHttp2 });
            }
          }
          break;

        // Cmd/Ctrl + K - Clear Results
        case "k":
          e.preventDefault();
          clearResults();
          selectEntry(null);
          break;

        // Cmd/Ctrl + L - Focus URL Input
        case "l":
          e.preventDefault();
          const urlInput = document.getElementById(URL_INPUT_ID);
          if (urlInput) {
            urlInput.focus();
            (urlInput as HTMLInputElement).select();
          }
          break;
      }
    },
    [
      isRunning,
      stats,
      showHistory,
      showLayoutSettings,
      showKeyboardGuide,
      url,
      method,
      numRequests,
      useHttp2,
      runTest,
      cancelTest,
      resetToDefaults,
      clearResults,
      selectEntry,
      setShowHistory,
      setShowLayoutSettings,
      setShowKeyboardGuide,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Returns the modifier key label based on platform.
 * Used for displaying shortcuts in the UI.
 */
export function getModifierKey(): string {
  return navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl";
}

/**
 * List of all available shortcuts for the keyboard guide.
 */
export const SHORTCUTS = [
  { keys: ["mod", "Enter"], description: "Run / Stop Test" },
  { keys: ["mod", "N"], description: "New Form (Reset)" },
  { keys: ["mod", "H"], description: "Toggle History" },
  { keys: ["mod", ","], description: "Layout Settings" },
  { keys: ["mod", "E"], description: "Export JSON" },
  { keys: ["mod", "Shift", "E"], description: "Export CSV" },
  { keys: ["mod", "K"], description: "Clear Results" },
  { keys: ["mod", "L"], description: "Focus URL" },
  { keys: ["Esc"], description: "Close Popover" },
] as const;
