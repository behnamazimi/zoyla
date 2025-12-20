/**
 * Test Runner Store - Manages test execution state
 * Independent store with no cross-store dependencies.
 */

import { create } from "zustand";
import type { TestRunnerState, TestRunnerActions } from "../types/store";
import type { LoadTestStats, ProgressUpdate } from "../types/api";

type TestRunnerStore = TestRunnerState & TestRunnerActions;

/**
 * Zustand store for test execution state.
 * Manages running status, progress, results, and errors.
 */
export const useTestRunnerStore = create<TestRunnerStore>()((set) => ({
  // Initial state
  isRunning: false,
  progress: null,
  stats: null,
  error: null,
  testStartTime: null,

  // Actions
  setRunning: (isRunning: boolean) =>
    set((state) => ({
      isRunning,
      // Record start time when test begins
      testStartTime: isRunning ? new Date() : state.testStartTime,
    })),

  setProgress: (progress: ProgressUpdate | null) => set({ progress }),

  setStats: (stats: LoadTestStats | null) => set({ stats }),

  setTestStartTime: (time: Date | null) => set({ testStartTime: time }),

  setError: (error: string | null) => set({ error }),

  clearResults: () =>
    set({
      stats: null,
      error: null,
      progress: null,
      testStartTime: null,
    }),
}));
