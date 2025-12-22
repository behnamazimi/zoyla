/**
 * Default Constants - Default values and configuration limits
 */

import type { LayoutSettings, TestConfigState } from "../types/store";
import type { HttpMethod } from "../types/api";

/** HTTP methods available in the app */
export const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
];

/** Default test configuration */
export const DEFAULT_TEST_CONFIG: TestConfigState = {
  url: "",
  method: "GET",
  numRequests: 100,
  concurrency: 50,
  useHttp2: false,
  headers: "", // Headers as textarea text
  followRedirects: true,
  timeoutSecs: 20, // 0 means infinite
  rateLimit: 0, // 0 means no rate limit
  randomizeUserAgent: false,
  randomizeHeaders: false,
  addCacheBuster: false,
  disableKeepAlive: false, // Keep connections alive by default for better performance
  workerThreads: 0, // 0 means use all available CPU cores
  proxyUrl: "", // Empty means no proxy
  body: "", // Empty means no body
  formFields: [], // Empty means no form fields (use body instead)
};

/** Default layout settings */
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  showThroughputChart: true,
  showLatencyChart: true,
  showHistogram: true,
  showPercentiles: true,
  showCorrelationChart: true,
  showErrorLogs: true,
};

/** Default sidebar width in pixels */
export const DEFAULT_SIDEBAR_WIDTH = 320;

/** Sidebar width constraints */
export const SIDEBAR_MIN_WIDTH = 280;
export const SIDEBAR_MAX_WIDTH = 500;

/** Request count limits */
export const MIN_REQUESTS = 1;
export const MAX_REQUESTS = 100000;

/** Concurrency limits */
export const MIN_CONCURRENCY = 1;
// Hard cap based on macOS DNS resolver limits (tested: 500 = 46% success rate)
export const MAX_CONCURRENCY = 1000;

/** Maximum history entries to keep */
export const MAX_HISTORY_ENTRIES = 50;
