/**
 * Store Types - State and action types for Zustand stores
 */

import type { HttpMethod, TestConfig, LoadTestStats, ProgressUpdate, HistoryEntry } from "./api";

/** Layout settings for toggling chart visibility */
export interface LayoutSettings {
  showThroughputChart: boolean;
  showLatencyChart: boolean;
  showHistogram: boolean;
  showPercentiles: boolean;
  showCorrelationChart: boolean;
  showErrorLogs: boolean;
}

/** Theme mode */
export type ThemeMode = "dark" | "light";

/** Test configuration state */
export interface TestConfigState {
  url: string;
  method: HttpMethod;
  numRequests: number;
  concurrency: number;
  useHttp2: boolean;
  headers: string; // Headers as textarea text (format: "Header-Name: value")
  followRedirects: boolean;
  /** Timeout for each request in seconds. 0 means infinite. */
  timeoutSecs: number;
  /** Rate limit in queries per second per worker. 0 means no limit. */
  rateLimit: number;
  randomizeUserAgent: boolean;
  randomizeHeaders: boolean;
  addCacheBuster: boolean;
  /** Disable keep-alive to prevent TCP connection reuse between requests. */
  disableKeepAlive: boolean;
  /** Number of worker threads to use. 0 means use all available CPU cores. */
  workerThreads: number;
  /** HTTP proxy address in format "host:port" or "http://host:port". Empty string means no proxy. */
  proxyUrl: string;
  /** Request body payload (optional, used for POST, PUT, PATCH methods). Empty string means no body. */
  body: string;
}

/** Test configuration actions */
export interface TestConfigActions {
  setUrl: (url: string) => void;
  setMethod: (method: HttpMethod) => void;
  setNumRequests: (count: number) => void;
  setConcurrency: (count: number) => void;
  setUseHttp2: (enabled: boolean) => void;
  setHeaders: (headers: string) => void;
  setFromHistoryEntry: (entry: HistoryEntry) => void;
  resetToDefaults: () => void;
  getConfig: () => TestConfig;
  setFollowRedirects: (enabled: boolean) => void;
  setTimeoutSecs: (secs: number) => void;
  setRateLimit: (qps: number) => void;
  setRandomizeUserAgent: (enabled: boolean) => void;
  setRandomizeHeaders: (enabled: boolean) => void;
  setAddCacheBuster: (enabled: boolean) => void;
  setDisableKeepAlive: (enabled: boolean) => void;
  setWorkerThreads: (threads: number) => void;
  setProxyUrl: (url: string) => void;
  setBody: (body: string) => void;
}

/** Test runner state */
export interface TestRunnerState {
  isRunning: boolean;
  progress: ProgressUpdate | null;
  stats: LoadTestStats | null;
  error: string | null;
  testStartTime: Date | null;
}

/** Test runner actions */
export interface TestRunnerActions {
  setRunning: (running: boolean) => void;
  setProgress: (progress: ProgressUpdate | null) => void;
  setStats: (stats: LoadTestStats | null) => void;
  setTestStartTime: (time: Date | null) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}

/** UI state */
export interface UIState {
  sidebarWidth: number;
  showHistory: boolean;
  showLayoutSettings: boolean;
  showHeaders: boolean;
  showPayload: boolean;
  showErrorLogs: boolean;
  showKeyboardGuide: boolean;
  layoutSettings: LayoutSettings;
  theme: ThemeMode;
}

/** UI actions */
export interface UIActions {
  setSidebarWidth: (width: number) => void;
  setShowHistory: (show: boolean) => void;
  setShowLayoutSettings: (show: boolean) => void;
  setShowHeaders: (show: boolean) => void;
  setShowPayload: (show: boolean) => void;
  setShowErrorLogs: (show: boolean) => void;
  setShowKeyboardGuide: (show: boolean) => void;
  updateLayoutSettings: (settings: Partial<LayoutSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  loadFromStorage: () => Promise<void>;
}

/** History state */
export interface HistoryState {
  entries: HistoryEntry[];
  selectedId: string | null;
}

/** History actions */
export interface HistoryActions {
  addEntry: (stats: LoadTestStats, config: TestConfigState) => void;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
  selectEntry: (id: string | null) => void;
  loadFromStorage: () => Promise<void>;
}
