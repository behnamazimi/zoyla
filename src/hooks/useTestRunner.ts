/**
 * useTestRunner - Orchestrates test execution across stores and services
 * This is the ONLY place where multiple stores interact.
 */

import { useCallback, useEffect, useRef } from "react";
import { useTestConfigStore, useTestRunnerStore, useHistoryStore, useUIStore } from "../store";
import { runLoadTest, cancelLoadTest, setupEventListeners } from "../services/tauri";
import type { ProgressUpdate } from "../types/api";

// Throttle progress updates to 5Hz (200ms) to reduce React re-renders
// The backend already throttles to 20Hz, this further reduces UI updates
const PROGRESS_THROTTLE_MS = 200;

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

  // Refs for progress throttling
  const lastProgressUpdateRef = useRef<number>(0);
  const pendingProgressRef = useRef<ProgressUpdate | null>(null);
  const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Setup event listeners on mount
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const setup = async () => {
      cleanup = await setupEventListeners(
        // Progress handler with throttling
        (progress) => {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastProgressUpdateRef.current;

          // Always update on completion (final progress)
          const isComplete = progress.completed === progress.total;

          if (isComplete || timeSinceLastUpdate >= PROGRESS_THROTTLE_MS) {
            // Enough time has passed, update immediately
            lastProgressUpdateRef.current = now;
            setProgress(progress);

            // Clear any pending throttled update
            if (throttleTimeoutRef.current) {
              clearTimeout(throttleTimeoutRef.current);
              throttleTimeoutRef.current = null;
            }
            pendingProgressRef.current = null;
          } else {
            // Store the latest progress for deferred update
            pendingProgressRef.current = progress;

            // Schedule a deferred update if not already scheduled
            if (!throttleTimeoutRef.current) {
              const delay = PROGRESS_THROTTLE_MS - timeSinceLastUpdate;
              throttleTimeoutRef.current = setTimeout(() => {
                if (pendingProgressRef.current) {
                  lastProgressUpdateRef.current = Date.now();
                  setProgress(pendingProgressRef.current);
                  pendingProgressRef.current = null;
                }
                throttleTimeoutRef.current = null;
              }, delay);
            }
          }
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
      // Clear any pending throttle timeout on unmount
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [setProgress, setRunning, setError]);

  /**
   * Validates that the URL is a proper HTTP/HTTPS URL.
   */
  const validateUrl = (url: string): string | null => {
    if (!url.trim()) {
      return "Please enter a URL";
    }

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return "URL must use http:// or https:// protocol";
      }
      return null;
    } catch {
      return "Please enter a valid URL (e.g., https://example.com)";
    }
  };

  /**
   * Starts a new load test.
   */
  const runTest = useCallback(async () => {
    const config = getConfig();

    const urlError = validateUrl(config.url);
    if (urlError) {
      setError(urlError);
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
        body: configState.body,
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
