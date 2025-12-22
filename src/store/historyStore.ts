/**
 * History Store - Manages test history entries
 * Independent store with no cross-store dependencies.
 */

import { create } from "zustand";
import type { HistoryState, HistoryActions, TestConfigState } from "../types/store";
import type { LoadTestStats, HistoryEntry } from "../types/api";
import { loadHistory, saveHistory } from "../services/storage";
import { MAX_HISTORY_ENTRIES } from "../constants/defaults";
import { parseHeaders } from "../utils/headers";

type HistoryStore = HistoryState & HistoryActions;

/**
 * Generates a unique ID for history entries.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a lightweight version of LoadTestStats for history storage.
 * Strips the large `results` array to reduce memory and storage overhead.
 * For 10K+ request tests, this can save megabytes of storage per entry.
 */
function createLightweightStats(stats: LoadTestStats): LoadTestStats {
  return {
    ...stats,
    // Strip the full results array - it can contain 10K+ items
    // Keep only the aggregated data needed for display
    results: [],
  };
}

/**
 * Zustand store for test history.
 * Manages saved test results with persistence.
 */
export const useHistoryStore = create<HistoryStore>()((set, get) => ({
  // Initial state
  entries: [],
  selectedId: null,

  // Actions
  addEntry: (stats: LoadTestStats, config: TestConfigState) => {
    // Create lightweight stats without the large results array
    const lightweightStats = createLightweightStats(stats);

    const entry: HistoryEntry = {
      id: generateId(),
      timestamp: Date.now(),
      url: config.url,
      method: config.method,
      numRequests: config.numRequests,
      concurrency: config.concurrency,
      useHttp2: config.useHttp2,
      headers:
        config.headers && config.headers.trim() !== ""
          ? parseHeaders(config.headers).map((h) => ({ key: h.key, value: h.value }))
          : undefined,
      followRedirects: config.followRedirects,
      timeoutSecs: config.timeoutSecs,
      rateLimit: config.rateLimit,
      randomizeUserAgent: config.randomizeUserAgent,
      randomizeHeaders: config.randomizeHeaders,
      addCacheBuster: config.addCacheBuster,
      disableKeepAlive: config.disableKeepAlive,
      workerThreads: config.workerThreads,
      proxyUrl: config.proxyUrl,
      body: config.body || undefined,
      totalTimeSecs: stats.total_time_secs,
      requestsPerSecond: stats.requests_per_second,
      avgResponseMs: stats.avg_response_time_ms,
      successfulRequests: stats.successful_requests,
      failedRequests: stats.failed_requests,
      stats: lightweightStats,
    };

    const newEntries = [entry, ...get().entries].slice(0, MAX_HISTORY_ENTRIES);
    set({ entries: newEntries });
    // Persist to storage (fire and forget)
    saveHistory(newEntries);
  },

  deleteEntry: (id: string) => {
    const newEntries = get().entries.filter((e) => e.id !== id);
    const selectedId = get().selectedId === id ? null : get().selectedId;
    set({ entries: newEntries, selectedId });
    saveHistory(newEntries);
  },

  clearAll: () => {
    set({ entries: [], selectedId: null });
    saveHistory([]);
  },

  selectEntry: (id: string | null) => set({ selectedId: id }),

  loadFromStorage: async () => {
    const entries = await loadHistory();
    set({ entries });
  },
}));
