/**
 * usePersistence - Hook for loading persisted data on app start
 */

import { useEffect } from "react";
import { useHistoryStore, useUIStore } from "../store";

/**
 * Hook that loads persisted data from storage on mount.
 * Should be called once at the app root level.
 */
export function usePersistence() {
  const loadHistory = useHistoryStore((s) => s.loadFromStorage);
  const loadSettings = useUIStore((s) => s.loadFromStorage);

  useEffect(() => {
    // Load persisted data on mount
    loadHistory();
    loadSettings();
  }, [loadHistory, loadSettings]);
}
