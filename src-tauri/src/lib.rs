use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;
use once_cell::sync::Lazy;
use thiserror::Error;
use rand::seq::SliceRandom;
use rand::Rng;

// Global cancellation flag and test generation counter
static CANCEL_FLAG: Lazy<Arc<AtomicBool>> = Lazy::new(|| Arc::new(AtomicBool::new(false)));
/// Generation counter to scope cancellation per-test run (prevents cross-test interference)
static TEST_GENERATION: AtomicU64 = AtomicU64::new(0);

// Progress throttling - stores last emission time as millis since UNIX_EPOCH
static LAST_PROGRESS_MS: AtomicU64 = AtomicU64::new(0);
const PROGRESS_THROTTLE_MS: u64 = 50; // ~20 updates per second

// Chart calculation constants
const THROUGHPUT_BUCKETS: usize = 30;
const THROUGHPUT_MIN_BUCKETS: usize = 5;
const HISTOGRAM_BUCKETS: usize = 10;
const LATENCY_SAMPLE_TARGET: usize = 100;
const CONCURRENCY_SAMPLE_TARGET: usize = 80;
const CONCURRENCY_MIN_SAMPLES: usize = 10;

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

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
    HEAD,
    OPTIONS,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomHeader {
    pub key: String,
    pub value: String,
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

#[derive(Debug, Serialize, Deserialize, Clone)]
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
/// Optimized to O(n) by pre-sorting and using running counters instead of O(n*buckets).
#[must_use]
fn calculate_throughput_over_time(results: &[RequestResult], total_time_secs: f64) -> Vec<ThroughputDataPoint> {
    if results.is_empty() || total_time_secs <= 0.0 {
        return vec![];
    }
    
    // Create time buckets (aim for ~20-50 data points)
    let num_buckets = THROUGHPUT_BUCKETS.min((total_time_secs * 10.0) as usize).max(THROUGHPUT_MIN_BUCKETS);
    let bucket_duration = total_time_secs / num_buckets as f64;
    
    // Pre-sort results by timestamp for O(n) processing
    let mut sorted_timestamps: Vec<f64> = results.iter().map(|r| r.timestamp_ms / 1000.0).collect();
    sorted_timestamps.sort_by(|a, b| a.total_cmp(b));
    
    let mut throughput_data: Vec<ThroughputDataPoint> = Vec::with_capacity(num_buckets);
    let mut result_index = 0;
    let mut cumulative: u32 = 0;
    
    for i in 0..num_buckets {
        let bucket_start = i as f64 * bucket_duration;
        let bucket_end = (i + 1) as f64 * bucket_duration;
        let mut requests_in_bucket: u32 = 0;
        
        // Count requests in this bucket using the sorted order
        while result_index < sorted_timestamps.len() && sorted_timestamps[result_index] < bucket_end {
            if sorted_timestamps[result_index] >= bucket_start {
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
#[must_use]
fn calculate_latency_over_time(results: &[RequestResult]) -> Vec<LatencyDataPoint> {
    if results.is_empty() {
        return vec![];
    }
    
    // Sort results by timestamp using total_cmp for stable NaN handling
    let mut sorted_results: Vec<_> = results.iter().collect();
    sorted_results.sort_by(|a, b| a.timestamp_ms.total_cmp(&b.timestamp_ms));
    
    let sample_rate = (sorted_results.len() / LATENCY_SAMPLE_TARGET).max(1);
    
    sorted_results
        .iter()
        .enumerate()
        .filter(|(i, _)| i % sample_rate == 0 || *i == sorted_results.len() - 1)
        .map(|(i, r)| LatencyDataPoint {
            request_num: i as u32 + 1,
            latency_ms: r.duration_ms,
            timestamp_ms: r.timestamp_ms,
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
#[must_use]
fn calculate_request_timeline(results: &[RequestResult]) -> Vec<RequestTimelinePoint> {
    if results.is_empty() {
        return vec![];
    }
    
    // Sort results by start time (timestamp - duration) to get chronological order
    // Use total_cmp for stable NaN handling and add bounds check for negative values
    let mut sorted_results: Vec<_> = results.iter().collect();
    sorted_results.sort_by(|a, b| {
        let a_start = (a.timestamp_ms - a.duration_ms).max(0.0);
        let b_start = (b.timestamp_ms - b.duration_ms).max(0.0);
        a_start.total_cmp(&b_start)
    });
    
    // Create timeline points: (start_time_secs, request_index)
    sorted_results
        .iter()
        .enumerate()
        .map(|(index, result)| {
            let start_time_ms = (result.timestamp_ms - result.duration_ms).max(0.0);
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

/// Context for making requests - groups related parameters to reduce function argument count
struct RequestContext {
    client: reqwest::Client,
    url: Arc<str>,
    method: HttpMethod,
    headers: Arc<[CustomHeader]>,
    completed: Arc<AtomicU32>,
    successful: Arc<AtomicU32>,
    failed: Arc<AtomicU32>,
    app_handle: AppHandle,
    total: u32,
    start_time: Instant,
    cancel_flag: Arc<AtomicBool>,
    /// Test generation when this context was created (for scoped cancellation)
    test_generation: u64,
    /// Minimum interval between requests per worker (for rate limiting)
    rate_limit_interval: Option<Duration>,
    randomize_user_agent: bool,
    randomize_headers: bool,
    add_cache_buster: bool,
}

/// Check if the current test should be cancelled.
/// Cancellation is scoped to the test generation to prevent cross-test interference.
#[inline]
fn is_cancelled(cancel_flag: &AtomicBool, expected_generation: u64) -> bool {
    // Only consider cancelled if the flag is set AND we're still on the same generation
    cancel_flag.load(Ordering::SeqCst) && TEST_GENERATION.load(Ordering::SeqCst) == expected_generation
}

#[allow(clippy::too_many_arguments)]
async fn make_request(ctx: &RequestContext, result_tx: &mpsc::UnboundedSender<RequestResult>) -> Option<()> {
    // Check if cancelled before starting (scoped to this test's generation)
    if is_cancelled(&ctx.cancel_flag, ctx.test_generation) {
        return None;
    }

    let request_start = Instant::now();
    
    // Build URL and request with randomization in a non-async block
    // This ensures the RNG doesn't live across await points
    let request = {
        let mut rng = rand::thread_rng();
        
        // Build URL with optional cache buster
        let url = if ctx.add_cache_buster {
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or(0);
            let random_suffix: u32 = rng.gen();
            let cache_buster = format!("_cb={}_{}", timestamp, random_suffix);
            
            if ctx.url.contains('?') {
                format!("{}&{}", ctx.url, cache_buster)
            } else {
                format!("{}?{}", ctx.url, cache_buster)
            }
        } else {
            ctx.url.to_string()
        };
        
        let mut request = match &ctx.method {
            HttpMethod::GET => ctx.client.get(&url),
            HttpMethod::POST => ctx.client.post(&url),
            HttpMethod::PUT => ctx.client.put(&url),
            HttpMethod::DELETE => ctx.client.delete(&url),
            HttpMethod::PATCH => ctx.client.patch(&url),
            HttpMethod::HEAD => ctx.client.head(&url),
            HttpMethod::OPTIONS => ctx.client.request(reqwest::Method::OPTIONS, &url),
        };
        
        // Add randomized User-Agent
        if ctx.randomize_user_agent {
            if let Some(user_agent) = USER_AGENTS.choose(&mut rng) {
                request = request.header("User-Agent", *user_agent);
            }
        }
        
        // Add randomized headers for browser-like behavior
        if ctx.randomize_headers {
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
        for header in ctx.headers.iter() {
            if !header.key.is_empty() {
                request = request.header(&header.key, &header.value);
            }
        }
        
        request
    }; // rng is dropped here, before any await
    
    // Check if cancelled before sending (scoped to this test's generation)
    if is_cancelled(&ctx.cancel_flag, ctx.test_generation) {
        return None;
    }
    
    // Create a cancellation check future that polls periodically (scoped to test generation)
    let cancel_flag_clone = Arc::clone(&ctx.cancel_flag);
    let test_generation = ctx.test_generation;
    let cancel_check = async move {
        loop {
            tokio::time::sleep(Duration::from_millis(50)).await;
            if is_cancelled(&cancel_flag_clone, test_generation) {
                return;
            }
        }
    };
    
    // Race between the request and cancellation
    let result = tokio::select! {
        response = request.send() => {
            match response {
                Ok(response) => {
                    // Check cancellation before reading body (scoped to test generation)
                    if is_cancelled(&ctx.cancel_flag, ctx.test_generation) {
                        return None;
                    }
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
                    
                    // Classify the error type
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
                    
                    // Create a more descriptive error message
                    let error_msg = match error_type {
                        ErrorType::Timeout => format!("Timeout after {:.1}ms - server did not respond in time", duration.as_secs_f64() * 1000.0),
                        ErrorType::Connection => format!("Connection failed: {}", e),
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
    
    // Check if cancelled after request (scoped to test generation)
    if is_cancelled(&ctx.cancel_flag, ctx.test_generation) {
        return None;
    }

    // Update counters
    let new_completed = ctx.completed.fetch_add(1, Ordering::SeqCst) + 1;
    if result.success {
        ctx.successful.fetch_add(1, Ordering::SeqCst);
    } else {
        ctx.failed.fetch_add(1, Ordering::SeqCst);
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
            successful: ctx.successful.load(Ordering::SeqCst),
            failed: ctx.failed.load(Ordering::SeqCst),
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
    let _new_generation = TEST_GENERATION.fetch_add(1, Ordering::SeqCst) + 1;
    
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
            
            rt.block_on(run_load_test_inner(app_handle_clone, config))
        })
        .await
        .map_err(|e| LoadTestError::Internal(format!("Task join error: {}", e)))?;
        
        return result;
    }
    
    // Use default runtime
    run_load_test_inner(app_handle, config).await
}

async fn run_load_test_inner(app_handle: AppHandle, config: LoadTestConfig) -> Result<LoadTestStats, LoadTestError> {
    
    // Concurrency control - default to num_requests if concurrency is 0 or greater than num_requests
    let concurrency = if config.concurrency == 0 || config.concurrency > config.num_requests {
        config.num_requests
    } else {
        config.concurrency
    };
    
    // Build HTTP client
    let mut client_builder = reqwest::Client::builder()
        .tcp_nodelay(true);
    
    // Configure connection pooling (disabled if keep-alive is off)
    if config.disable_keep_alive {
        // Disable connection pooling entirely - each request gets a fresh connection
        client_builder = client_builder
            .pool_max_idle_per_host(0)
            .pool_idle_timeout(Duration::from_millis(1))
            .connection_verbose(true);
    } else {
        // Enable connection pooling for better performance
        client_builder = client_builder
            .pool_max_idle_per_host(concurrency as usize)
            .pool_idle_timeout(Duration::from_secs(90));
    }
    
    // Configure request timeout (0 = infinite)
    if config.timeout_secs > 0.0 {
        client_builder = client_builder.timeout(Duration::from_secs_f64(config.timeout_secs));
    }
    
    // Configure HTTP version
    if config.use_http2 {
        client_builder = client_builder.http2_prior_knowledge();
    } else {
        client_builder = client_builder.http1_only();
    }
    
    // Configure redirect policy
    if !config.follow_redirects {
        client_builder = client_builder.redirect(reqwest::redirect::Policy::none());
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
        client_builder = client_builder.proxy(proxy);
    }
    
    let client = client_builder.build()?;

    let start = Instant::now();
    let cancel_flag = Arc::clone(&CANCEL_FLAG);
    
    let semaphore = Arc::new(tokio::sync::Semaphore::new(concurrency as usize));
    
    // Shared state for progress tracking
    let completed = Arc::new(AtomicU32::new(0));
    let successful = Arc::new(AtomicU32::new(0));
    let failed = Arc::new(AtomicU32::new(0));
    
    // Use channel for result collection to reduce mutex contention
    let (result_tx, mut result_rx) = mpsc::unbounded_channel::<RequestResult>();
    
    // Pre-allocate results vector
    let results_capacity = config.num_requests as usize;
    
    // Use Arc for shared immutable data to avoid cloning per request
    let url: Arc<str> = config.url.into();
    let headers: Arc<[CustomHeader]> = config.headers.into();
    let method = config.method;
    let num_requests = config.num_requests;
    
    // Calculate rate limit interval (if rate_limit > 0, interval = 1/rate_limit seconds)
    let rate_limit_interval = if config.rate_limit > 0.0 {
        Some(Duration::from_secs_f64(1.0 / config.rate_limit))
    } else {
        None
    };
    
    // Create shared request context (without the sender to allow proper channel closing)
    // Capture the current test generation for scoped cancellation
    let current_generation = TEST_GENERATION.load(Ordering::SeqCst);
    
    let base_ctx = Arc::new(RequestContext {
        client,
        url,
        method,
        headers,
        completed,
        successful,
        failed,
        app_handle,
        total: num_requests,
        start_time: start,
        cancel_flag,
        test_generation: current_generation,
        rate_limit_interval,
        randomize_user_agent: config.randomize_user_agent,
        randomize_headers: config.randomize_headers,
        add_cache_buster: config.add_cache_buster,
    });
    
    // Create all request futures with semaphore for concurrency control
    let futures: Vec<_> = (0..num_requests)
        .map(|_| {
            let sem = Arc::clone(&semaphore);
            let ctx = Arc::clone(&base_ctx);
            let tx = result_tx.clone();
            
            async move {
                // Check cancellation before waiting for semaphore (scoped to test generation)
                if is_cancelled(&ctx.cancel_flag, ctx.test_generation) {
                    return;
                }
                
                // Race between semaphore acquisition and cancellation
                let permit = loop {
                    tokio::select! {
                        biased; // Prefer checking semaphore first
                        permit = sem.acquire() => {
                            match permit {
                                Ok(p) => break p,
                                Err(_) => return,
                            }
                        }
                        _ = tokio::time::sleep(Duration::from_millis(50)) => {
                            if is_cancelled(&ctx.cancel_flag, ctx.test_generation) {
                                return;
                            }
                        }
                    }
                };
                
                // Check cancellation after acquiring permit (scoped to test generation)
                if is_cancelled(&ctx.cancel_flag, ctx.test_generation) {
                    drop(permit);
                    return;
                }
                
                // Apply rate limiting delay if configured
                if let Some(interval) = ctx.rate_limit_interval {
                    // Check cancellation during rate limit wait (scoped to test generation)
                    let cancel_flag = Arc::clone(&ctx.cancel_flag);
                    let gen = ctx.test_generation;
                    tokio::select! {
                        _ = tokio::time::sleep(interval) => {}
                        _ = async {
                            loop {
                                tokio::time::sleep(Duration::from_millis(50)).await;
                                if is_cancelled(&cancel_flag, gen) {
                                    return;
                                }
                            }
                        } => {
                            drop(permit);
                            return;
                        }
                    }
                }
                
                let _ = make_request(&ctx, &tx).await;
                
                drop(permit);
                // tx is dropped here when the future completes
            }
        })
        .collect();
    
    // Drop the original sender so the channel closes when all futures complete
    drop(result_tx);
    
    // Execute all requests with controlled concurrency
    futures::future::join_all(futures).await;
    
    let total_time = start.elapsed();
    let total_time_secs = total_time.as_secs_f64();
    
    // Collect results from channel
    let mut results = Vec::with_capacity(results_capacity);
    while let Some(result) = result_rx.recv().await {
        results.push(result);
    }
    
    // Calculate statistics in a single pass where possible
    let mut successful_requests = 0u32;
    let mut failed_requests = 0u32;
    let mut sum_response_time = 0.0f64;
    let mut min_response_time = f64::INFINITY;
    let mut max_response_time = f64::NEG_INFINITY;
    let mut status_map: HashMap<u16, u32> = HashMap::new();
    let mut error_logs: Vec<ErrorLogEntry> = Vec::new();
    
    // Single pass through results for basic stats
    for result in &results {
        if result.success {
            successful_requests += 1;
        } else {
            failed_requests += 1;
            error_logs.push(ErrorLogEntry {
                timestamp_ms: result.timestamp_ms,
                status: result.status,
                error: result.error.clone().unwrap_or_else(|| format!("HTTP {}", result.status)),
                error_type: result.error_type.clone(),
                duration_ms: result.duration_ms,
            });
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
    
    // Extract response times for histogram and percentiles
    let response_times: Vec<f64> = results.iter().map(|r| r.duration_ms).collect();
    
    // Calculate histogram
    let histogram = build_histogram(&response_times, min_response_time, max_response_time, HISTOGRAM_BUCKETS);
    
    // Calculate percentiles using total_cmp for stable NaN handling
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
    
    // Calculate time-series data for charts
    let throughput_over_time = calculate_throughput_over_time(&results, total_time_secs);
    let latency_over_time = calculate_latency_over_time(&results);
    
    // Calculate concurrency over time
    let concurrency_over_time = calculate_concurrency_over_time(&results, total_time_secs);
    
    // Calculate request timeline (elapsed time vs request index)
    let request_timeline = calculate_request_timeline(&results);

    Ok(LoadTestStats {
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
    })
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
