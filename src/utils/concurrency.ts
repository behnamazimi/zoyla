/**
 * Concurrency Recommendation Utility
 * Calculates optimal parallel request count based on system resources and test configuration
 *
 * Notes on limits:
 * - macOS sandbox may throttle concurrent network connections
 * - System DNS resolver (mDNSResponder) has internal concurrency limits
 * - Very high concurrency (500+) may cause connection bursts that overwhelm targets
 */

export interface ConcurrencyFactors {
  cpuCores: number;
  useHttp2: boolean;
  disableKeepAlive: boolean;
  url: string;
  pastSuccessRate?: number; // From history (0-100)
}

export interface ConcurrencyRecommendation {
  suggested: number;
  max: number;
  factors: {
    base: number;
    http2Multiplier: number;
    keepAliveMultiplier: number;
    localMultiplier: number;
    historyAdjustment: number;
  };
  warnings: string[];
  breakdown: string[];
}

// Base multiplier per CPU core
const BASE_PER_CORE = 15;
// Maximum safe multiplier per CPU core
const MAX_PER_CORE = 50;
// Soft recommended limit for external targets (above this, show warnings)
const EXTERNAL_RECOMMENDED_MAX = 200;
// Higher limit for local targets (no DNS overhead, faster connections)
const LOCAL_RECOMMENDED_MAX = 1000;
// Absolute max - hard cap based on macOS DNS resolver limits
export const ABSOLUTE_MAX = 1000;

/**
 * Checks if the URL targets localhost or local network
 */
function isLocalTarget(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("172.17.") ||
      hostname.startsWith("172.18.") ||
      hostname.startsWith("172.19.") ||
      hostname.startsWith("172.20.") ||
      hostname.startsWith("172.21.") ||
      hostname.startsWith("172.22.") ||
      hostname.startsWith("172.23.") ||
      hostname.startsWith("172.24.") ||
      hostname.startsWith("172.25.") ||
      hostname.startsWith("172.26.") ||
      hostname.startsWith("172.27.") ||
      hostname.startsWith("172.28.") ||
      hostname.startsWith("172.29.") ||
      hostname.startsWith("172.30.") ||
      hostname.startsWith("172.31.")
    );
  } catch {
    return false;
  }
}

/**
 * Calculates the recommended concurrency based on system resources and test configuration
 */
export function calculateConcurrencyRecommendation(
  factors: ConcurrencyFactors
): ConcurrencyRecommendation {
  const { cpuCores, useHttp2, disableKeepAlive, url, pastSuccessRate } = factors;

  const warnings: string[] = [];
  const breakdown: string[] = [];

  // Start with base calculation
  const base = cpuCores * BASE_PER_CORE;
  breakdown.push(`Base: ${cpuCores} cores × ${BASE_PER_CORE} = ${base}`);

  let suggested = base;

  // HTTP/2 multiplier (2x - multiplexed connections over single TCP)
  const http2Multiplier = useHttp2 ? 2.0 : 1.0;
  if (useHttp2) {
    suggested *= http2Multiplier;
    breakdown.push(`HTTP/2: ×2.0 (multiplexed connections)`);
  }

  // Keep-alive multiplier (1.5x when enabled, 0.5x when disabled)
  const keepAliveMultiplier = disableKeepAlive ? 0.5 : 1.5;
  if (disableKeepAlive) {
    suggested *= keepAliveMultiplier;
    breakdown.push(`Keep-alive OFF: ×0.5 (new connection per request)`);
  } else {
    suggested *= keepAliveMultiplier;
    breakdown.push(`Keep-alive ON: ×1.5 (connection reuse)`);
  }

  // Local target multiplier (2x - no network latency)
  const isLocal = isLocalTarget(url);
  const localMultiplier = isLocal ? 2.0 : 1.0;
  if (isLocal) {
    suggested *= localMultiplier;
    breakdown.push(`Local target: ×2.0 (minimal latency)`);
  }

  // History-based adjustment
  let historyAdjustment = 1.0;
  if (pastSuccessRate !== undefined && pastSuccessRate < 90) {
    historyAdjustment = 0.75;
    suggested *= historyAdjustment;
    breakdown.push(`Past success rate ${pastSuccessRate.toFixed(0)}%: ×0.75`);
    warnings.push(`Previous tests had ${(100 - pastSuccessRate).toFixed(0)}% failure rate`);
  }

  // Calculate max based on target type (soft limit, not hard cap)
  const systemMax = cpuCores * MAX_PER_CORE;
  const recommendedMax = isLocal ? LOCAL_RECOMMENDED_MAX : EXTERNAL_RECOMMENDED_MAX;
  const max = Math.min(systemMax, recommendedMax);

  // Round to nice numbers
  suggested = Math.round(suggested / 10) * 10;
  suggested = Math.max(10, Math.min(suggested, max));

  breakdown.push(`Recommended max: ${max} (${isLocal ? "local" : "external"} target)`);

  return {
    suggested,
    max,
    factors: {
      base,
      http2Multiplier,
      keepAliveMultiplier,
      localMultiplier,
      historyAdjustment,
    },
    warnings,
    breakdown,
  };
}

/**
 * Generates warning messages if the user's concurrency setting seems problematic
 */
export function getConcurrencyWarnings(
  currentValue: number,
  recommendation: ConcurrencyRecommendation
): string[] {
  const warnings = [...recommendation.warnings];

  if (currentValue > recommendation.max) {
    warnings.push(
      `Values above ${recommendation.max} may cause DNS/connection errors - test incrementally`
    );
  } else if (currentValue > recommendation.suggested * 2) {
    warnings.push(`Higher than recommended (${recommendation.suggested}) - monitor for errors`);
  }

  if (currentValue < 10) {
    warnings.push("Very low concurrency may result in slow test completion");
  }

  return warnings;
}
