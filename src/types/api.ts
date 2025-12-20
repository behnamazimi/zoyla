/**
 * API Types - Types matching Rust backend structs
 * These types represent the data contract between frontend and backend.
 */

/** HTTP methods supported by the load tester */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

/** Custom HTTP header for requests */
export interface CustomHeader {
  id: string;
  key: string;
  value: string;
}

/** Configuration for a load test run */
export interface TestConfig {
  url: string;
  num_requests: number;
  concurrency: number;
  use_http2: boolean;
  method: HttpMethod;
  headers: Array<{ key: string; value: string }>;
  follow_redirects: boolean;
  /** Timeout for each request in seconds. 0 means infinite. */
  timeout_secs: number;
  /** Rate limit in queries per second per worker. 0 means no limit. */
  rate_limit: number;
  randomize_user_agent: boolean;
  randomize_headers: boolean;
  add_cache_buster: boolean;
  /** Disable keep-alive to prevent TCP connection reuse between requests. */
  disable_keep_alive: boolean;
  /** Number of worker threads to use. 0 means use all available CPU cores. */
  worker_threads: number;
  /** HTTP proxy address in format "host:port" or "http://host:port". Empty string means no proxy. */
  proxy_url: string;
}

/** Error type classification for failed requests */
export type ErrorType =
  | "None" // No error - request succeeded
  | "Timeout" // Request timed out waiting for response (server too slow)
  | "Connection" // Failed to establish connection (DNS, TCP connect, TLS handshake)
  | "Request" // Request was built/sent incorrectly
  | "Response" // Server returned an error response (4xx, 5xx)
  | "Redirect" // Redirect error (too many redirects, redirect loop)
  | "Other"; // Other/unknown error

/** Result of a single HTTP request */
export interface RequestResult {
  status: number;
  duration_ms: number;
  success: boolean;
  error: string | null;
  /** Categorized error type for easier analysis */
  error_type: ErrorType;
  timestamp_ms: number;
}

/** Histogram bucket for response time distribution */
export interface HistogramBucket {
  min_ms: number;
  max_ms: number;
  count: number;
}

/** Latency percentiles (p10 through p99) */
export interface LatencyPercentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

/** Count of responses by status code */
export interface StatusCodeCount {
  code: number;
  count: number;
}

/** Throughput data point for time series chart */
export interface ThroughputDataPoint {
  time_secs: number;
  requests_completed: number;
  rps: number;
}

/** Latency data point for time series chart */
export interface LatencyDataPoint {
  request_num: number;
  latency_ms: number;
  timestamp_ms: number;
}

/** Concurrency data point showing concurrent requests over time */
export interface ConcurrencyDataPoint {
  time_secs: number;
  concurrent_requests: number;
}

/** Request timeline point showing when each request started */
export interface RequestTimelinePoint {
  time_secs: number;
  request_index: number;
}

/** Error log entry for failed requests */
export interface ErrorLogEntry {
  timestamp_ms: number;
  status: number;
  error: string;
  error_type: ErrorType;
  duration_ms: number;
}

/** Complete statistics from a load test run */
export interface LoadTestStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_time_secs: number;
  avg_response_time_ms: number;
  min_response_time_ms: number;
  max_response_time_ms: number;
  requests_per_second: number;
  histogram: HistogramBucket[];
  percentiles: LatencyPercentiles;
  status_codes: StatusCodeCount[];
  results: RequestResult[];
  throughput_over_time: ThroughputDataPoint[];
  latency_over_time: LatencyDataPoint[];
  error_logs: ErrorLogEntry[];
  concurrency_over_time: ConcurrencyDataPoint[];
  request_timeline: RequestTimelinePoint[];
}

/** Real-time progress update during test execution */
export interface ProgressUpdate {
  completed: number;
  total: number;
  successful: number;
  failed: number;
  current_rps: number;
  elapsed_secs: number;
  latest_response_time_ms: number;
}

/** Saved test history entry */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  numRequests: number;
  concurrency: number;
  useHttp2: boolean;
  /** Headers array (optional for backward compatibility with old entries) */
  headers?: Array<{ key: string; value: string }>;
  /** Follow redirects (optional for backward compatibility) */
  followRedirects?: boolean;
  /** Timeout in seconds (optional for backward compatibility) */
  timeoutSecs?: number;
  /** Rate limit (optional for backward compatibility) */
  rateLimit?: number;
  /** Randomize user agent (optional for backward compatibility) */
  randomizeUserAgent?: boolean;
  /** Randomize headers (optional for backward compatibility) */
  randomizeHeaders?: boolean;
  /** Add cache buster (optional for backward compatibility) */
  addCacheBuster?: boolean;
  /** Disable keep alive (optional for backward compatibility) */
  disableKeepAlive?: boolean;
  /** Worker threads (optional for backward compatibility) */
  workerThreads?: number;
  /** Proxy URL (optional for backward compatibility) */
  proxyUrl?: string;
  totalTimeSecs: number;
  requestsPerSecond: number;
  avgResponseMs: number;
  successfulRequests: number;
  failedRequests: number;
  stats: LoadTestStats;
}
