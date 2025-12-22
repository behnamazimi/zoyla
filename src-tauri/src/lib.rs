use bytes::Bytes;
use futures::stream::{self, StreamExt};
use rand::seq::SliceRandom;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error as StdError;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use thiserror::Error;
use tokio::sync::mpsc;

// Global cancellation flag - no Arc needed for static lifetime
static CANCEL_FLAG: AtomicBool = AtomicBool::new(false);
/// Generation counter to scope cancellation per-test run (prevents cross-test interference)
static TEST_GENERATION: AtomicU64 = AtomicU64::new(0);

// Progress throttling - stores last emission time as millis since UNIX_EPOCH
static LAST_PROGRESS_MS: AtomicU64 = AtomicU64::new(0);
const PROGRESS_THROTTLE_MS: u64 = 100; // ~10 updates per second (frontend further throttles to 5Hz)

/// Poll interval for cancellation checks in async operations
const CANCEL_POLL_MS: u64 = 50;

// Chart calculation constants
const THROUGHPUT_BUCKETS: usize = 30;
const THROUGHPUT_MIN_BUCKETS: usize = 5;
const HISTOGRAM_BUCKETS: usize = 10;
const LATENCY_SAMPLE_TARGET: usize = 400;
const CONCURRENCY_SAMPLE_TARGET: usize = 200;
const CONCURRENCY_MIN_SAMPLES: usize = 20;
const TIMELINE_SAMPLE_TARGET: usize = 500;
const ERROR_LOGS_MAX: usize = 1000;

/// Default capacity for status code HashMap (typical tests have 1-5 unique codes)
const STATUS_MAP_CAPACITY: usize = 8;

// User-Agent pool for randomization
static USER_AGENTS: &[&str] = &[
    // Chrome on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    // Chrome on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    // Firefox on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    // Firefox on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",
    // Safari on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    // Edge on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
    // Chrome on Linux
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    // Firefox on Linux
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

// Accept-Language variations
static ACCEPT_LANGUAGES: &[&str] = &[
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-US,en;q=0.9,es;q=0.8",
    "en-US,en;q=0.9,fr;q=0.8",
    "en-US,en;q=0.9,de;q=0.8",
    "de-DE,de;q=0.9,en;q=0.8",
    "fr-FR,fr;q=0.9,en;q=0.8",
    "es-ES,es;q=0.9,en;q=0.8",
    "en,*;q=0.5",
];

#[derive(Debug, Error)]
pub enum LoadTestError {
    #[error("HTTP client error: {0}")]
    ClientBuild(#[from] reqwest::Error),
    #[error("Test cancelled by user")]
    Cancelled,
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

impl Serialize for LoadTestError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Default)]
pub enum HttpMethod {
    #[default]
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    HEAD,
    OPTIONS,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CustomHeader {
    pub key: String,
    pub value: String,
}

/// Form field for multipart/form-data requests
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FormFieldConfig {
    pub name: String,
    pub value: String,
    /// If set, this is a file field with the absolute file path
    #[serde(default)]
    pub file_path: Option<String>,
    /// Original filename (used in Content-Disposition)
    #[serde(default)]
    pub file_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoadTestConfig {
    pub url: String,
    pub num_requests: u32,
    pub concurrency: u32,
    pub use_http2: bool,
    pub method: HttpMethod,
    pub headers: Vec<CustomHeader>,
    #[serde(default = "default_true")]
    pub follow_redirects: bool,
    /// Timeout for each request in seconds. 0 means infinite.
    #[serde(default = "default_timeout")]
    pub timeout_secs: f64,
    /// Rate limit in queries per second per worker. 0 means no limit.
    #[serde(default)]
    pub rate_limit: f64,
    #[serde(default)]
    pub randomize_user_agent: bool,
    #[serde(default)]
    pub randomize_headers: bool,
    #[serde(default)]
    pub add_cache_buster: bool,
    /// Disable keep-alive to prevent TCP connection reuse between requests.
    #[serde(default)]
    pub disable_keep_alive: bool,
    /// Number of worker threads to use. 0 means use all available CPU cores.
    #[serde(default)]
    pub worker_threads: u32,
    /// HTTP proxy address in format "host:port" or "http://host:port". Empty string means no proxy.
    #[serde(default)]
    pub proxy_url: String,
    /// Request body payload (optional, used for POST, PUT, PATCH methods). Empty string means no body.
    #[serde(default)]
    pub body: Option<String>,
    /// Content-Type header value (optional, auto-detected from body by frontend).
    #[serde(default)]
    pub payload_content_type: Option<String>,
    /// Form fields for multipart/form-data (optional, alternative to body). If set, body is ignored.
    #[serde(default)]
    pub form_fields: Option<Vec<FormFieldConfig>>,
}

fn default_true() -> bool {
    true
}

fn default_timeout() -> f64 {
    20.0
}

/// Error type classification for failed requests
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Default)]
pub enum ErrorType {
    /// No error - request succeeded
    #[default]
    None,
    /// Request timed out waiting for response (server too slow)
    Timeout,
    /// Failed to establish connection (DNS, TCP connect, TLS handshake)
    Connection,
    /// Request was built/sent incorrectly
    Request,
    /// Server returned an error response (4xx, 5xx)
    Response,
    /// Redirect error (too many redirects, redirect loop)
    Redirect,
    /// Other/unknown error
    Other,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RequestResult {
    pub status: u16,
    pub duration_ms: f64,
    pub success: bool,
    pub error: Option<String>,
    /// Categorized error type for easier analysis
    #[serde(default)]
    pub error_type: ErrorType,
    pub timestamp_ms: f64, // Time since test start when request completed
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HistogramBucket {
    pub min_ms: f64,
    pub max_ms: f64,
    pub count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct LatencyPercentiles {
    pub p10: f64,
    pub p25: f64,
    pub p50: f64,
    pub p75: f64,
    pub p90: f64,
    pub p95: f64,
    pub p99: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatusCodeCount {
    pub code: u16,
    pub count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProgressUpdate {
    pub completed: u32,
    pub total: u32,
    pub successful: u32,
    pub failed: u32,
    pub current_rps: f64,
    pub elapsed_secs: f64,
    pub latest_response_time_ms: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ThroughputDataPoint {
    pub time_secs: f64,
    pub requests_completed: u32,
    pub rps: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LatencyDataPoint {
    pub request_num: u32,
    pub latency_ms: f64,
    pub timestamp_ms: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ErrorLogEntry {
    pub timestamp_ms: f64,
    pub status: u16,
    pub error: String,
    pub error_type: ErrorType,
    pub duration_ms: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConcurrencyDataPoint {
    pub time_secs: f64,
    pub concurrent_requests: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RequestTimelinePoint {
    pub time_secs: f64,
    pub request_index: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoadTestStats {
    pub total_requests: u32,
    pub successful_requests: u32,
    pub failed_requests: u32,
    pub total_time_secs: f64,
    pub avg_response_time_ms: f64,
    pub min_response_time_ms: f64,
    pub max_response_time_ms: f64,
    pub requests_per_second: f64,
    pub histogram: Vec<HistogramBucket>,
    pub percentiles: LatencyPercentiles,
    pub status_codes: Vec<StatusCodeCount>,
    pub results: Vec<RequestResult>,
    pub throughput_over_time: Vec<ThroughputDataPoint>,
    pub latency_over_time: Vec<LatencyDataPoint>,
    pub error_logs: Vec<ErrorLogEntry>,
    pub concurrency_over_time: Vec<ConcurrencyDataPoint>,
    pub request_timeline: Vec<RequestTimelinePoint>,
}

/// Calculates the given percentile from a sorted slice of response times.
/// Returns 0.0 for empty slices.
#[inline]
#[must_use]
fn calculate_percentile(sorted_times: &[f64], percentile: f64) -> f64 {
    if sorted_times.is_empty() {
        return 0.0;
    }
    let index = ((percentile / 100.0) * (sorted_times.len() - 1) as f64).round() as usize;
    sorted_times[index.min(sorted_times.len() - 1)]
}

/// Builds a histogram of response times with the specified number of buckets.
#[inline]
#[must_use]
fn build_histogram(times: &[f64], min: f64, max: f64, buckets: usize) -> Vec<HistogramBucket> {
    if times.is_empty() || buckets == 0 {
        return vec![];
    }
    
    let range = max - min;
    let bucket_size = if range > 0.0 { range / buckets as f64 } else { 1.0 };
    
    let mut histogram: Vec<HistogramBucket> = (0..buckets)
        .map(|i| HistogramBucket {
            min_ms: min + (i as f64 * bucket_size),
            max_ms: min + ((i + 1) as f64 * bucket_size),
            count: 0,
        })
        .collect();
    
    for &time in times {
        let bucket_index = if range > 0.0 {
            ((time - min) / bucket_size).floor() as usize
        } else {
            0
        };
        let bucket_index = bucket_index.min(buckets - 1);
        histogram[bucket_index].count += 1;
    }
    
    histogram
}

/// Calculates throughput over time by bucketing results into time intervals.
/// Optimized to O(n) by using pre-sorted indices instead of O(n*buckets).
/// Accepts pre-sorted indices to avoid redundant sorting.
#[must_use]
fn calculate_throughput_over_time(
    results: &[RequestResult],
    total_time_secs: f64,
    sorted_by_timestamp: &[usize],
) -> Vec<ThroughputDataPoint> {
    if results.is_empty() || total_time_secs <= 0.0 {
        return vec![];
    }
    
    // Create time buckets (aim for ~20-50 data points)
    let num_buckets = THROUGHPUT_BUCKETS.min((total_time_secs * 10.0) as usize).max(THROUGHPUT_MIN_BUCKETS);
    let bucket_duration = total_time_secs / num_buckets as f64;
    
    let mut throughput_data: Vec<ThroughputDataPoint> = Vec::with_capacity(num_buckets);
    let mut result_index = 0;
    let mut cumulative: u32 = 0;
    
    for i in 0..num_buckets {
        let bucket_start = i as f64 * bucket_duration;
        let bucket_end = (i + 1) as f64 * bucket_duration;
        let mut requests_in_bucket: u32 = 0;
        
        // Count requests in this bucket using the pre-sorted order
        while result_index < sorted_by_timestamp.len() {
            let timestamp_secs = results[sorted_by_timestamp[result_index]].timestamp_ms / 1000.0;
            if timestamp_secs >= bucket_end {
                break;
            }
            if timestamp_secs >= bucket_start {
                requests_in_bucket += 1;
            }
            cumulative += 1;
            result_index += 1;
        }
        
        // Calculate RPS for this bucket
        let rps = if bucket_duration > 0.0 {
            requests_in_bucket as f64 / bucket_duration
        } else {
            0.0
        };
        
        throughput_data.push(ThroughputDataPoint {
            time_secs: bucket_end,
            requests_completed: cumulative,
            rps,
        });
    }
    
    throughput_data
}

/// Calculates latency data points over time, sampling for chart display.
/// Accepts pre-sorted indices to avoid redundant sorting.
#[must_use]
fn calculate_latency_over_time(
    results: &[RequestResult],
    sorted_by_timestamp: &[usize],
) -> Vec<LatencyDataPoint> {
    if results.is_empty() {
        return vec![];
    }
    
    let sample_rate = (sorted_by_timestamp.len() / LATENCY_SAMPLE_TARGET).max(1);
    let total = sorted_by_timestamp.len();
    
    sorted_by_timestamp
        .iter()
        .enumerate()
        .filter(|(i, _)| i % sample_rate == 0 || *i == total - 1)
        .map(|(i, &idx)| {
            let r = &results[idx];
            LatencyDataPoint {
                request_num: i as u32 + 1,
                latency_ms: r.duration_ms,
                timestamp_ms: r.timestamp_ms,
            }
        })
        .collect()
}

/// Calculate concurrency over time by tracking when requests start and end.
/// Returns a scatter plot of time vs concurrent request count.
#[must_use]
fn calculate_concurrency_over_time(results: &[RequestResult], total_time_secs: f64) -> Vec<ConcurrencyDataPoint> {
    if results.is_empty() || total_time_secs <= 0.0 {
        return vec![];
    }
    
    // Create events for request start and end
    #[derive(Debug, Clone)]
    enum EventType {
        Start,
        End,
    }
    
    #[derive(Debug, Clone)]
    struct Event {
        time_ms: f64,
        event_type: EventType,
    }
    
    let mut events = Vec::new();
    for result in results {
        // Calculate start time: end_time - duration, with bounds check to prevent negative values
        let start_time_ms = (result.timestamp_ms - result.duration_ms).max(0.0);
        events.push(Event {
            time_ms: start_time_ms,
            event_type: EventType::Start,
        });
        events.push(Event {
            time_ms: result.timestamp_ms,
            event_type: EventType::End,
        });
    }
    
    // Sort events by time using total_cmp for stable NaN handling
    events.sort_by(|a, b| a.time_ms.total_cmp(&b.time_ms));
    
    // Sample concurrency at regular intervals (aim for ~50-100 data points)
    let num_samples = CONCURRENCY_SAMPLE_TARGET.min((total_time_secs * 10.0) as usize).max(CONCURRENCY_MIN_SAMPLES);
    let sample_interval_secs = total_time_secs / num_samples as f64;
    
    let mut concurrency_data = Vec::with_capacity(num_samples);
    let mut current_concurrency = 0u32;
    let mut event_index = 0;
    
    for i in 0..num_samples {
        let sample_time_secs = (i as f64 + 0.5) * sample_interval_secs; // Sample at midpoint of interval
        let sample_time_ms = sample_time_secs * 1000.0;
        
        // Process all events up to this sample time
        while event_index < events.len() && events[event_index].time_ms <= sample_time_ms {
            match events[event_index].event_type {
                EventType::Start => current_concurrency += 1,
                EventType::End => current_concurrency = current_concurrency.saturating_sub(1),
            }
            event_index += 1;
        }
        
        concurrency_data.push(ConcurrencyDataPoint {
            time_secs: sample_time_secs,
            concurrent_requests: current_concurrency,
        });
    }
    
    concurrency_data
}

/// Calculate request timeline: elapsed time vs request index.
/// Each request is plotted at its start time with its sequential index.
/// Samples data to TIMELINE_SAMPLE_TARGET points for performance with large datasets.
#[must_use]
fn calculate_request_timeline(results: &[RequestResult]) -> Vec<RequestTimelinePoint> {
    if results.is_empty() {
        return vec![];
    }
    
    // Pre-compute start times once (O(n)) instead of calculating in comparator (O(n log n) * 2)
    let mut start_times: Vec<(usize, f64)> = results
        .iter()
        .enumerate()
        .map(|(i, r)| (i, (r.timestamp_ms - r.duration_ms).max(0.0)))
        .collect();
    
    // Sort by pre-computed start time
    start_times.sort_by(|a, b| a.1.total_cmp(&b.1));
    
    // Sample the results to avoid overwhelming the UI with too many points
    let sample_rate = (start_times.len() / TIMELINE_SAMPLE_TARGET).max(1);
    let total_results = start_times.len();
    
    // Create timeline points: (start_time_secs, request_index)
    // Always include first and last points for accurate range display
    start_times
        .iter()
        .enumerate()
        .filter(|(i, _)| *i % sample_rate == 0 || *i == total_results - 1)
        .map(|(index, (_, start_time_ms))| {
            RequestTimelinePoint {
                time_secs: start_time_ms / 1000.0,
                request_index: (index + 1) as u32,
            }
        })
        .collect()
}

/// Check if enough time has passed to emit a progress update (throttling)
#[inline]
fn should_emit_progress() -> bool {
    let now_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);
    
    let last = LAST_PROGRESS_MS.load(Ordering::Relaxed);
    if now_ms.saturating_sub(last) >= PROGRESS_THROTTLE_MS {
        // Try to update - if another thread beat us, that's fine
        let _ = LAST_PROGRESS_MS.compare_exchange(last, now_ms, Ordering::Relaxed, Ordering::Relaxed);
        true
    } else {
        false
    }
}

/// Cached file content for multipart form-data
#[derive(Debug, Clone)]
struct CachedFile {
    content: Bytes,
    file_name: String,
}

/// Form field for building multipart requests
#[derive(Debug, Clone)]
struct FormField {
    name: String,
    value: String,
    /// Cached file content (if this is a file field)
    file: Option<CachedFile>,
}

/// Immutable configuration for a test run
struct TestConfig {
    url: Arc<str>,
    method: HttpMethod,
    headers: Arc<[CustomHeader]>,
    /// Minimum interval between requests per worker (for rate limiting)
    rate_limit_interval: Option<Duration>,
    randomize_user_agent: bool,
    randomize_headers: bool,
    add_cache_buster: bool,
    /// Request body payload (optional, used for POST, PUT, PATCH methods)
    /// Uses Bytes for cheap cloning (Arc internally)
    body: Option<Bytes>,
    /// Content-Type header value (detected by frontend)
    payload_content_type: Option<String>,
    /// Whether to disable keep-alive (add Connection: close header)
    disable_keep_alive: bool,
    /// Form fields for multipart/form-data (optional, takes precedence over body)
    form_fields: Option<Arc<[FormField]>>,
}

/// Shared mutable counters for progress tracking
struct TestCounters {
    completed: AtomicU32,
    successful: AtomicU32,
    failed: AtomicU32,
    /// Connection errors specifically (for adaptive pooling)
    connection_errors: AtomicU32,
}

impl TestCounters {
    fn new() -> Self {
        Self {
            completed: AtomicU32::new(0),
            successful: AtomicU32::new(0),
            failed: AtomicU32::new(0),
            connection_errors: AtomicU32::new(0),
        }
    }
}

/// Threshold for connection errors before switching to fresh connections
/// If more than 5% of completed requests have connection errors, force fresh connections
const CONNECTION_ERROR_THRESHOLD_PERCENT: u32 = 5;
/// Minimum requests before adaptive behavior kicks in
const MIN_REQUESTS_FOR_ADAPTIVE: u32 = 50;

/// Context for making requests - groups related parameters
struct RequestContext {
    client: reqwest::Client,
    config: Arc<TestConfig>,
    counters: Arc<TestCounters>,
    app_handle: AppHandle,
    total: u32,
    start_time: Instant,
    cancel_flag: &'static AtomicBool,
    /// Test generation when this context was created (for scoped cancellation)
    test_generation: u64,
}

/// Check if the current test should be cancelled.
/// Cancellation is scoped to the test generation to prevent cross-test interference.
#[inline]
fn is_cancelled(cancel_flag: &AtomicBool, expected_generation: u64) -> bool {
    // Only consider cancelled if the flag is set AND we're still on the same generation
    cancel_flag.load(Ordering::SeqCst) && TEST_GENERATION.load(Ordering::SeqCst) == expected_generation
}

/// Macro to check cancellation and return early if cancelled.
/// Reduces boilerplate for the common cancellation check pattern.
macro_rules! check_cancelled {
    // Return None (for Option-returning functions)
    ($ctx:expr) => {
        if is_cancelled($ctx.cancel_flag, $ctx.test_generation) {
            return None;
        }
    };
    // Return unit with optional cleanup (for async closures)
    ($ctx:expr, return) => {
        if is_cancelled($ctx.cancel_flag, $ctx.test_generation) {
            return;
        }
    };
}

async fn make_request(ctx: &RequestContext, result_tx: &mpsc::UnboundedSender<RequestResult>) -> Option<()> {
    // Check if cancelled before starting (scoped to this test's generation)
    check_cancelled!(ctx);

    let request_start = Instant::now();
    
    // Build URL and request with randomization in a non-async block
    // This ensures the RNG doesn't live across await points
    let config = &ctx.config;
    let request = {
        let mut rng = rand::thread_rng();
        
        // Build URL with optional cache buster
        let url = if config.add_cache_buster {
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or(0);
            let random_suffix: u32 = rng.gen();
            let cache_buster = format!("_cb={}_{}", timestamp, random_suffix);
            
            if config.url.contains('?') {
                format!("{}&{}", config.url, cache_buster)
            } else {
                format!("{}?{}", config.url, cache_buster)
            }
        } else {
            config.url.to_string()
        };
        
        let mut request = match &config.method {
            HttpMethod::GET => ctx.client.get(&url),
            HttpMethod::POST => ctx.client.post(&url),
            HttpMethod::PUT => ctx.client.put(&url),
            HttpMethod::DELETE => ctx.client.delete(&url),
            HttpMethod::PATCH => ctx.client.patch(&url),
            HttpMethod::HEAD => ctx.client.head(&url),
            HttpMethod::OPTIONS => ctx.client.request(reqwest::Method::OPTIONS, &url),
        };
        
        // Check if we should force fresh connections (adaptive behavior)
        // If connection error rate exceeds threshold, stop using pooled connections
        let force_fresh_connection = {
            let completed = ctx.counters.completed.load(Ordering::Relaxed);
            let conn_errors = ctx.counters.connection_errors.load(Ordering::Relaxed);
            
            // Only activate adaptive behavior after minimum requests
            if completed >= MIN_REQUESTS_FOR_ADAPTIVE && conn_errors > 0 {
                let error_percent = (conn_errors * 100) / completed.max(1);
                error_percent >= CONNECTION_ERROR_THRESHOLD_PERCENT
            } else {
                false
            }
        };
        
        // Add Connection: close header when keep-alive is disabled OR when adaptive behavior kicks in
        // This tells the server not to keep the connection open after the response
        if config.disable_keep_alive || force_fresh_connection {
            request = request.header("Connection", "close");
        }
        
        // Add randomized User-Agent
        if config.randomize_user_agent {
            if let Some(user_agent) = USER_AGENTS.choose(&mut rng) {
                request = request.header("User-Agent", *user_agent);
            }
        }
        
        // Add randomized headers for browser-like behavior
        if config.randomize_headers {
            // Randomize Accept-Language
            if let Some(accept_lang) = ACCEPT_LANGUAGES.choose(&mut rng) {
                request = request.header("Accept-Language", *accept_lang);
            }
            
            // Add Sec-Fetch headers (modern browser fingerprint)
            request = request
                .header("Sec-Fetch-Dest", "empty")
                .header("Sec-Fetch-Mode", "cors")
                .header("Sec-Fetch-Site", "cross-site")
                .header("Sec-Ch-Ua-Mobile", "?0")
                .header("Sec-Ch-Ua-Platform", if rng.gen_bool(0.5) { "\"Windows\"" } else { "\"macOS\"" });
            
            // Randomize Accept header ordering
            let accept_values = [
                "application/json",
                "text/html",
                "application/xhtml+xml",
                "application/xml;q=0.9",
                "*/*;q=0.8",
            ];
            let mut shuffled: Vec<&str> = accept_values.to_vec();
            shuffled.shuffle(&mut rng);
            request = request.header("Accept", shuffled.join(", "));
        }
        
        // Add custom headers (these override randomized ones if same key)
        // Check if Content-Type is already set by user
        let mut has_content_type = false;
        for header in config.headers.iter() {
            if !header.key.is_empty() {
                if header.key.eq_ignore_ascii_case("Content-Type") {
                    has_content_type = true;
                }
                request = request.header(&header.key, &header.value);
            }
        }
        
        // Add body or multipart form for POST, PUT, PATCH methods
        if let Some(form_fields) = &config.form_fields {
            // Build multipart form from cached form fields
            let mut form = reqwest::multipart::Form::new();
            for field in form_fields.iter() {
                if let Some(file) = &field.file {
                    // File field - use Part with filename
                    let part = reqwest::multipart::Part::bytes(file.content.to_vec())
                        .file_name(file.file_name.clone());
                    form = form.part(field.name.clone(), part);
                } else {
                    // Text field
                    form = form.text(field.name.clone(), field.value.clone());
                }
            }
            request = request.multipart(form);
        } else if let Some(body) = &config.body {
            // Regular body (JSON, XML, etc.)
            // Bytes clone is cheap (Arc internally) - no string allocation per request
            if !body.is_empty() {
                // Use content type from frontend (auto-detected) if not already set by user
                if !has_content_type {
                    if let Some(content_type) = &config.payload_content_type {
                        request = request.header("Content-Type", content_type);
                    }
                }
                request = request.body(body.clone());
            }
        }
        
        request
    }; // rng is dropped here, before any await
    
    // Check if cancelled before sending
    check_cancelled!(ctx);
    
    // Create a cancellation check future that polls periodically (scoped to test generation)
    let cancel_flag_ref = ctx.cancel_flag;
    let test_generation = ctx.test_generation;
    let cancel_check = async move {
        loop {
            tokio::time::sleep(Duration::from_millis(CANCEL_POLL_MS)).await;
            if is_cancelled(cancel_flag_ref, test_generation) {
                return;
            }
        }
    };
    
    // Race between the request and cancellation
    let result = tokio::select! {
        response = request.send() => {
            match response {
                Ok(response) => {
                    // Check cancellation before reading body
                    check_cancelled!(ctx);
                    let status = response.status().as_u16();
                    let success = response.status().is_success();
                    // Consume body to ensure connection can be reused
                    let _ = response.bytes().await;
                    let duration = request_start.elapsed();
                    let timestamp = ctx.start_time.elapsed();
                    
                    // Check if this is a server error (4xx/5xx) even though request "succeeded"
                    let (error, error_type) = if !success {
                        (Some(format!("HTTP {}", status)), ErrorType::Response)
                    } else {
                        (None, ErrorType::None)
                    };
                    
                    RequestResult {
                        status,
                        duration_ms: duration.as_secs_f64() * 1000.0,
                        success,
                        error,
                        error_type,
                        timestamp_ms: timestamp.as_secs_f64() * 1000.0,
                    }
                }
                Err(e) => {
                    let duration = request_start.elapsed();
                    let timestamp = ctx.start_time.elapsed();
                    
                    // Classify the error type with resource exhaustion detection
                    let err_str = e.to_string().to_lowercase();
                    
                    // Track connection errors for adaptive pooling behavior
                    // Both is_connect() and the stale connection case (is_connect + is_request) are tracked
                    if e.is_connect() {
                        ctx.counters.connection_errors.fetch_add(1, Ordering::Relaxed);
                    }
                    
                    let error_type = if e.is_timeout() {
                        ErrorType::Timeout
                    } else if e.is_connect() {
                        ErrorType::Connection
                    } else if e.is_request() {
                        ErrorType::Request
                    } else if e.is_redirect() {
                        ErrorType::Redirect
                    } else {
                        ErrorType::Other
                    };
                    
                    // Build full error string including source chain for pattern matching
                    let full_err_str = {
                        let mut parts = vec![err_str.clone()];
                        let mut source = e.source();
                        while let Some(src) = source {
                            parts.push(src.to_string().to_lowercase());
                            source = src.source();
                        }
                        parts.join(" ")
                    };
                    
                    // Create error message
                    let error_msg = match error_type {
                        ErrorType::Timeout => format!("Timeout after {}ms", duration.as_millis()),
                        ErrorType::Connection => {
                            // Simpler error messages for common connection errors
                            // Check full error chain for patterns
                            if full_err_str.contains("dns") || full_err_str.contains("resolve") {
                                format!("DNS resolution failed: {}", e)
                            } else if full_err_str.contains("refused") {
                                "Connection refused by server".to_string()
                            } else if full_err_str.contains("reset") {
                                "Connection reset by server".to_string()
                            } else if full_err_str.contains("too many open files") || full_err_str.contains("emfile") {
                                "Too many open connections (reduce concurrency)".to_string()
                            } else if full_err_str.contains("closed") || full_err_str.contains("broken pipe") {
                                // Different message based on whether connection pooling is enabled
                                if ctx.config.disable_keep_alive {
                                    // No pool = server is closing connections (likely overloaded)
                                    "Connection closed by server (server may be overloaded)".to_string()
                                } else {
                                    // Pool enabled = likely a stale connection from the pool
                                    "Connection closed (stale connection from pool)".to_string()
                                }
                            } else {
                                format!("Connection failed: {}", e)
                            }
                        }
                        ErrorType::Request => format!("Request error: {}", e),
                        ErrorType::Redirect => format!("Redirect error: {}", e),
                        _ => e.to_string(),
                    };
                    
                    RequestResult {
                        status: 0,
                        duration_ms: duration.as_secs_f64() * 1000.0,
                        success: false,
                        error: Some(error_msg),
                        error_type,
                        timestamp_ms: timestamp.as_secs_f64() * 1000.0,
                    }
                }
            }
        }
        _ = cancel_check => {
            // Cancelled - return None immediately
            return None;
        }
    };
    
    // Check if cancelled after request
    check_cancelled!(ctx);

    // Update counters (Relaxed ordering is sufficient for counters - no synchronization needed)
    let counters = &ctx.counters;
    let new_completed = counters.completed.fetch_add(1, Ordering::Relaxed) + 1;
    if result.success {
        counters.successful.fetch_add(1, Ordering::Relaxed);
    } else {
        counters.failed.fetch_add(1, Ordering::Relaxed);
    }
    
    let duration_ms = result.duration_ms;
    
    // Send result through channel (non-blocking)
    let _ = result_tx.send(result);
    
    // Emit progress update with throttling
    if should_emit_progress() || new_completed == ctx.total {
        let elapsed = ctx.start_time.elapsed().as_secs_f64();
        let current_rps = if elapsed > 0.0 { new_completed as f64 / elapsed } else { 0.0 };
        
        let progress = ProgressUpdate {
            completed: new_completed,
            total: ctx.total,
            successful: counters.successful.load(Ordering::Relaxed),
            failed: counters.failed.load(Ordering::Relaxed),
            current_rps,
            elapsed_secs: elapsed,
            latest_response_time_ms: duration_ms,
        };
        
        let _ = ctx.app_handle.emit("load-test-progress", progress);
    }
    
    Some(())
}

#[tauri::command]
async fn cancel_load_test(app_handle: AppHandle) -> Result<(), LoadTestError> {
    CANCEL_FLAG.store(true, Ordering::SeqCst);
    // Emit cancellation event so frontend can react immediately
    let _ = app_handle.emit("load-test-cancelled", ());
    Ok(())
}

#[tauri::command]
async fn run_load_test(app_handle: AppHandle, config: LoadTestConfig) -> Result<LoadTestStats, LoadTestError> {
    // Validate configuration
    if config.num_requests == 0 {
        return Err(LoadTestError::InvalidConfig("num_requests must be greater than 0".into()));
    }
    if config.url.is_empty() {
        return Err(LoadTestError::InvalidConfig("URL cannot be empty".into()));
    }
    
    // Validate URL format
    match url::Url::parse(&config.url) {
        Ok(parsed_url) => {
            // Only allow http and https schemes
            if parsed_url.scheme() != "http" && parsed_url.scheme() != "https" {
                return Err(LoadTestError::InvalidConfig(
                    format!("URL must use http or https scheme, got: {}", parsed_url.scheme())
                ));
            }
        }
        Err(e) => {
            return Err(LoadTestError::InvalidConfig(format!("Invalid URL '{}': {}", config.url, e)));
        }
    }
    
    // Determine number of worker threads
    let default_threads = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);
    let worker_threads = if config.worker_threads == 0 {
        default_threads
    } else {
        config.worker_threads as usize
    };
    
    // Increment test generation to invalidate any previous test's cancellation state
    // This prevents lingering async tasks from a cancelled test from affecting new tests
    let current_generation = TEST_GENERATION.fetch_add(1, Ordering::SeqCst) + 1;
    
    // Reset cancellation flag and progress throttle at start
    CANCEL_FLAG.store(false, Ordering::SeqCst);
    LAST_PROGRESS_MS.store(0, Ordering::Relaxed);
    
    // If using custom thread count, spawn a dedicated runtime
    if config.worker_threads > 0 && (config.worker_threads as usize) != default_threads {
        let app_handle_clone = app_handle.clone();
        let result = tokio::task::spawn_blocking(move || {
            let rt = tokio::runtime::Builder::new_multi_thread()
                .worker_threads(worker_threads)
                .enable_all()
                .build()
                .map_err(|e| LoadTestError::Internal(format!("Failed to create runtime: {}", e)))?;
            
            rt.block_on(run_load_test_inner(app_handle_clone, config, current_generation))
        })
        .await
        .map_err(|e| LoadTestError::Internal(format!("Task join error: {}", e)))?;
        
        return result;
    }
    
    // Use default runtime
    run_load_test_inner(app_handle, config, current_generation).await
}

/// Builds an HTTP client with the specified configuration
fn build_http_client(config: &LoadTestConfig, concurrency: u32) -> Result<reqwest::Client, LoadTestError> {
    let mut builder = reqwest::Client::builder()
        .tcp_nodelay(true)
        // TCP keep-alive to prevent connections from being silently closed by routers/firewalls
        // This is different from HTTP keep-alive - it sends TCP-level probes to keep connections alive
        .tcp_keepalive(Duration::from_secs(15))
        // Connection timeout - time to establish TCP connection (separate from request timeout)
        .connect_timeout(Duration::from_secs(30));
    
    // Configure connection pooling (disabled if keep-alive is off)
    if config.disable_keep_alive {
        // Disable connection pooling entirely - each request gets a fresh connection
        // pool_max_idle_per_host(0) ensures connections are not reused after going idle
        builder = builder.pool_max_idle_per_host(0);
        // Force HTTP/1.1 when keep-alive is disabled to support Connection: close header
        // (HTTP/2 handles connection management differently and doesn't use Connection header)
        if !config.use_http2 {
            builder = builder.http1_only();
        }
    } else {
        // Enable connection pooling for better performance
        // Pool size should match concurrency to avoid connection contention
        // Cap at reasonable limit to prevent resource exhaustion
        let pool_size = concurrency.min(500) as usize;
        builder = builder
            .pool_max_idle_per_host(pool_size)
            // Very short idle timeout (100ms) to proactively close connections
            // before servers close them (avoiding stale connection errors)
            // If a connection isn't reused within 100ms, we close it ourselves
            .pool_idle_timeout(Duration::from_millis(100));
    }
    
    // Configure request timeout (0 = infinite)
    if config.timeout_secs > 0.0 {
        builder = builder.timeout(Duration::from_secs_f64(config.timeout_secs));
    }
    
    // Configure HTTP version (only if not already set by keep-alive logic)
    if config.use_http2 {
        builder = builder.http2_prior_knowledge();
    } else if !config.disable_keep_alive {
        // Only set http1_only if we haven't already set it for keep-alive
        builder = builder.http1_only();
    }
    
    // Configure redirect policy
    if !config.follow_redirects {
        builder = builder.redirect(reqwest::redirect::Policy::none());
    }
    
    // Configure HTTP proxy
    if !config.proxy_url.is_empty() {
        let proxy_url = if config.proxy_url.starts_with("http://") || config.proxy_url.starts_with("https://") {
            config.proxy_url.clone()
        } else {
            format!("http://{}", config.proxy_url)
        };
        
        let proxy = reqwest::Proxy::all(&proxy_url)
            .map_err(|e| LoadTestError::InvalidConfig(format!("Invalid proxy URL '{}': {}", proxy_url, e)))?;
        builder = builder.proxy(proxy);
    }
    
    builder.build().map_err(LoadTestError::from)
}

async fn run_load_test_inner(
    app_handle: AppHandle,
    config: LoadTestConfig,
    current_generation: u64,
) -> Result<LoadTestStats, LoadTestError> {
    // Concurrency control - default to num_requests if concurrency is 0 or greater than num_requests
    let concurrency = if config.concurrency == 0 || config.concurrency > config.num_requests {
        config.num_requests
    } else {
        config.concurrency
    };
    
    // Build HTTP client
    let client = build_http_client(&config, concurrency)?;

    let start = Instant::now();
    
    // Use channel for result collection to reduce mutex contention
    let (result_tx, mut result_rx) = mpsc::unbounded_channel::<RequestResult>();
    
    // Pre-allocate results vector
    let results_capacity = config.num_requests as usize;
    let num_requests = config.num_requests;
    
    // Calculate rate limit interval (if rate_limit > 0, interval = 1/rate_limit seconds)
    let rate_limit_interval = if config.rate_limit > 0.0 {
        Some(Duration::from_secs_f64(1.0 / config.rate_limit))
    } else {
        None
    };
    
    // Process form fields if present (load file contents)
    let form_fields: Option<Arc<[FormField]>> = if let Some(fields) = config.form_fields {
        if !fields.is_empty() {
            let mut processed_fields = Vec::with_capacity(fields.len());
            for field in fields {
                let file = if let Some(file_path) = &field.file_path {
                    // Read file content once and cache it
                    let content = std::fs::read(file_path)
                        .map_err(|e| LoadTestError::InvalidConfig(
                            format!("Failed to read file '{}': {}", file_path, e)
                        ))?;
                    let file_name = field.file_name.clone()
                        .or_else(|| file_path.split('/').last().map(String::from))
                        .or_else(|| file_path.split('\\').last().map(String::from))
                        .unwrap_or_else(|| "file".to_string());
                    Some(CachedFile {
                        content: Bytes::from(content),
                        file_name,
                    })
                } else {
                    None
                };
                processed_fields.push(FormField {
                    name: field.name,
                    value: field.value,
                    file,
                });
            }
            Some(processed_fields.into())
        } else {
            None
        }
    } else {
        None
    };

    // Convert body to Bytes for cheap cloning (Arc internally)
    // Only use body if no form fields are present
    let body_bytes = if form_fields.is_some() {
        None
    } else {
        config.body.map(Bytes::from)
    };
    
    // Create test config with immutable settings
    let test_config = Arc::new(TestConfig {
        url: config.url.into(),
        method: config.method,
        headers: config.headers.into(),
        rate_limit_interval,
        randomize_user_agent: config.randomize_user_agent,
        randomize_headers: config.randomize_headers,
        add_cache_buster: config.add_cache_buster,
        body: body_bytes,
        payload_content_type: config.payload_content_type,
        disable_keep_alive: config.disable_keep_alive,
        form_fields,
    });
    
    // Create shared counters
    let counters = Arc::new(TestCounters::new());
    
    // Create shared request context using the generation passed from run_load_test
    let base_ctx = Arc::new(RequestContext {
        client,
        config: test_config,
        counters,
        app_handle,
        total: num_requests,
        start_time: start,
        cancel_flag: &CANCEL_FLAG,
        test_generation: current_generation,
    });
    
    // Use buffer_unordered to control concurrency efficiently
    // This only creates `concurrency` futures at a time, avoiding the memory pressure
    // of creating all futures upfront with join_all + semaphore
    {
        // Scope the sender so it's dropped when the stream completes
        let request_stream = stream::iter(0..num_requests)
            .map(|_| {
                let ctx = Arc::clone(&base_ctx);
                let tx = result_tx.clone();
                
                async move {
                    // Check cancellation before starting
                    if is_cancelled(ctx.cancel_flag, ctx.test_generation) {
                        return;
                    }
                    
                    // Apply rate limiting delay if configured
                    if let Some(interval) = ctx.config.rate_limit_interval {
                        // Simple cancellation check during rate limit - no complex select! loop needed
                        tokio::select! {
                            biased;
                            _ = tokio::time::sleep(interval) => {}
                            _ = async {
                                while !is_cancelled(ctx.cancel_flag, ctx.test_generation) {
                                    tokio::time::sleep(Duration::from_millis(CANCEL_POLL_MS)).await;
                                }
                            } => {
                                return;
                            }
                        }
                    }
                    
                    let _ = make_request(&ctx, &tx).await;
                }
            })
            .buffer_unordered(concurrency as usize);
        
        // Execute all requests with controlled concurrency
        // buffer_unordered ensures only `concurrency` futures run at a time
        request_stream.for_each(|_| async {}).await;
        
        // Drop the original sender so channel closes when stream completes
        drop(result_tx);
    }
    
    let total_time = start.elapsed();
    let total_time_secs = total_time.as_secs_f64();
    
    // Collect results from channel
    let mut results = Vec::with_capacity(results_capacity);
    while let Some(result) = result_rx.recv().await {
        results.push(result);
    }
    
    // Calculate and return statistics
    Ok(calculate_stats(results, num_requests, total_time_secs))
}

/// Calculates all statistics from the collected request results
fn calculate_stats(results: Vec<RequestResult>, num_requests: u32, total_time_secs: f64) -> LoadTestStats {
    // Calculate basic stats in a single pass
    let mut successful_requests = 0u32;
    let mut failed_requests = 0u32;
    let mut sum_response_time = 0.0f64;
    let mut min_response_time = f64::INFINITY;
    let mut max_response_time = f64::NEG_INFINITY;
    let mut status_map: HashMap<u16, u32> = HashMap::with_capacity(STATUS_MAP_CAPACITY);
    let mut error_logs: Vec<ErrorLogEntry> = Vec::with_capacity(ERROR_LOGS_MAX.min(results.len()));
    
    // Single pass through results for basic stats
    for result in &results {
        if result.success {
            successful_requests += 1;
        } else {
            failed_requests += 1;
            // Only collect up to ERROR_LOGS_MAX error logs
            if error_logs.len() < ERROR_LOGS_MAX {
                let error_msg = result.error.clone()
                    .unwrap_or_else(|| format!("HTTP {}", result.status));
                error_logs.push(ErrorLogEntry {
                    timestamp_ms: result.timestamp_ms,
                    status: result.status,
                    error: error_msg,
                    error_type: result.error_type.clone(),
                    duration_ms: result.duration_ms,
                });
            }
        }
        
        sum_response_time += result.duration_ms;
        min_response_time = min_response_time.min(result.duration_ms);
        max_response_time = max_response_time.max(result.duration_ms);
        *status_map.entry(result.status).or_insert(0) += 1;
    }
    
    let avg_response_time = if !results.is_empty() {
        sum_response_time / results.len() as f64
    } else {
        0.0
    };
    
    let min_response_time = if min_response_time.is_infinite() { 0.0 } else { min_response_time };
    let max_response_time = if max_response_time.is_infinite() { 0.0 } else { max_response_time };
    
    let requests_per_second = if total_time_secs > 0.0 {
        results.len() as f64 / total_time_secs
    } else {
        0.0
    };
    
    // Calculate histogram and percentiles
    let response_times: Vec<f64> = results.iter().map(|r| r.duration_ms).collect();
    let histogram = build_histogram(&response_times, min_response_time, max_response_time, HISTOGRAM_BUCKETS);
    
    let mut sorted_times = response_times;
    sorted_times.sort_by(|a, b| a.total_cmp(b));
    
    let percentiles = LatencyPercentiles {
        p10: calculate_percentile(&sorted_times, 10.0),
        p25: calculate_percentile(&sorted_times, 25.0),
        p50: calculate_percentile(&sorted_times, 50.0),
        p75: calculate_percentile(&sorted_times, 75.0),
        p90: calculate_percentile(&sorted_times, 90.0),
        p95: calculate_percentile(&sorted_times, 95.0),
        p99: calculate_percentile(&sorted_times, 99.0),
    };
    
    // Convert status map to sorted vec
    let mut status_codes: Vec<StatusCodeCount> = status_map
        .into_iter()
        .map(|(code, count)| StatusCodeCount { code, count })
        .collect();
    status_codes.sort_by(|a, b| b.count.cmp(&a.count));
    
    // Pre-sort results by timestamp once - reused by multiple chart calculations
    let mut sorted_by_timestamp: Vec<usize> = (0..results.len()).collect();
    sorted_by_timestamp.sort_by(|&a, &b| {
        results[a].timestamp_ms.total_cmp(&results[b].timestamp_ms)
    });
    
    // Calculate time-series data for charts
    let throughput_over_time = calculate_throughput_over_time(&results, total_time_secs, &sorted_by_timestamp);
    let latency_over_time = calculate_latency_over_time(&results, &sorted_by_timestamp);
    let concurrency_over_time = calculate_concurrency_over_time(&results, total_time_secs);
    let request_timeline = calculate_request_timeline(&results);

    LoadTestStats {
        total_requests: num_requests,
        successful_requests,
        failed_requests,
        total_time_secs,
        avg_response_time_ms: avg_response_time,
        min_response_time_ms: min_response_time,
        max_response_time_ms: max_response_time,
        requests_per_second,
        histogram,
        percentiles,
        status_codes,
        results,
        throughput_over_time,
        latency_over_time,
        error_logs,
        concurrency_over_time,
        request_timeline,
    }
}

/// Get the number of available CPU cores on this machine
#[tauri::command]
fn get_available_cpus() -> u32 {
    std::thread::available_parallelism()
        .map(|n| n.get() as u32)
        .unwrap_or(4) // Fallback to 4 if detection fails
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![run_load_test, cancel_load_test, get_available_cpus])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
