/**
 * useTestRunner - Orchestrates test execution across stores and services
 * This is the ONLY place where multiple stores interact.
 */

import { useCallback, useEffect } from "react";
import { useTestConfigStore, useTestRunnerStore, useHistoryStore, useUIStore } from "../store";
import { runLoadTest, cancelLoadTest, setupEventListeners } from "../services/tauri";

/**
 * Hook that coordinates test execution between stores and services.
 * Returns run and cancel functions for controlling tests.
 */
export function useTestRunner() {
  const getConfig = useTestConfigStore((s) => s.getConfig);
  const configState = useTestConfigStore();
  const { setRunning, setProgress, setStats, setError, clearResults } = useTestRunnerStore();
  const addToHistory = useHistoryStore((s) => s.addEntry);
  const selectEntry = useHistoryStore((s) => s.selectEntry);
  const setShowErrorLogs = useUIStore((s) => s.setShowErrorLogs);

  // Setup event listeners on mount
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const setup = async () => {
      cleanup = await setupEventListeners(
        // Progress handler
        (progress) => {
          setProgress(progress);
        },
        // Cancel handler
        () => {
          setRunning(false);
          setProgress(null);
          setError("Test cancelled by user.");
        }
      );
    };

    setup();

    return () => {
      if (cleanup) cleanup();
    };
  }, [setProgress, setRunning, setError]);

  /**
   * Starts a new load test.
   */
  const runTest = useCallback(async () => {
    const config = getConfig();

    if (!config.url) {
      setError("Please enter a URL");
      return;
    }

    // Clear previous results first, then set running (which sets testStartTime)
    clearResults();
    setError(null);
    selectEntry(null);
    setRunning(true);

    try {
      const stats = await runLoadTest(config);
      setStats(stats);

      // Add to history with current config state (extract state fields only)
      addToHistory(stats, {
        url: configState.url,
        method: configState.method,
        numRequests: configState.numRequests,
        concurrency: configState.concurrency,
        useHttp2: configState.useHttp2,
        headers: configState.headers,
        followRedirects: configState.followRedirects,
        timeoutSecs: configState.timeoutSecs,
        rateLimit: configState.rateLimit,
        randomizeUserAgent: configState.randomizeUserAgent,
        randomizeHeaders: configState.randomizeHeaders,
        addCacheBuster: configState.addCacheBuster,
        disableKeepAlive: configState.disableKeepAlive,
        workerThreads: configState.workerThreads,
        proxyUrl: configState.proxyUrl,
      });

      // Auto-show error logs if there are failures
      if (stats.error_logs.length > 0) {
        setShowErrorLogs(true);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }, [
    getConfig,
    configState,
    setRunning,
    setError,
    clearResults,
    selectEntry,
    setStats,
    setProgress,
    addToHistory,
    setShowErrorLogs,
  ]);

  /**
   * Cancels the currently running test.
   */
  const cancelTest = useCallback(async () => {
    try {
      await cancelLoadTest();
    } catch {
      // Silently handle cancellation errors
    }
  }, []);

  return { runTest, cancelTest };
}
