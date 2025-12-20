/**
 * Transform Utilities - Data transformations for charts
 */

import type { LoadTestStats, HistogramBucket, LatencyPercentiles } from "../types/api";

/** Chart data point for histogram */
export interface HistogramChartData {
  name: string;
  count: number;
  range: string;
}

/** Chart data point for percentiles */
export interface PercentileChartData {
  percentile: string;
  value: number;
  label: string;
}

/**
 * Transforms histogram buckets to chart-friendly format.
 * @param histogram - Raw histogram buckets from stats
 * @returns Array of chart data points
 */
export function transformHistogramData(histogram: HistogramBucket[]): HistogramChartData[] {
  return histogram.map((bucket) => ({
    name: `${bucket.min_ms.toFixed(0)} ms`,
    count: bucket.count,
    range: `${bucket.min_ms.toFixed(0)}-${bucket.max_ms.toFixed(0)}ms`,
  }));
}

/**
 * Transforms percentiles to chart-friendly format.
 * @param percentiles - Raw percentiles from stats
 * @returns Array of chart data points
 */
export function transformPercentileData(percentiles: LatencyPercentiles): PercentileChartData[] {
  return [
    { percentile: "p10", value: percentiles.p10, label: "10%" },
    { percentile: "p25", value: percentiles.p25, label: "25%" },
    { percentile: "p50", value: percentiles.p50, label: "50%" },
    { percentile: "p75", value: percentiles.p75, label: "75%" },
    { percentile: "p90", value: percentiles.p90, label: "90%" },
    { percentile: "p95", value: percentiles.p95, label: "95%" },
    { percentile: "p99", value: percentiles.p99, label: "99%" },
  ];
}

/**
 * Transforms request timeline data for scatter plot display.
 * @param stats - Full test statistics
 * @returns Array of scatter plot data points (time_secs, request_index)
 */
export function transformRequestTimelineData(
  stats: LoadTestStats
): Array<{ time_secs: number; request_index: number }> {
  if (!stats.request_timeline || stats.request_timeline.length === 0) {
    return [];
  }

  return stats.request_timeline.map((point) => ({
    time_secs: point.time_secs,
    request_index: point.request_index,
  }));
}
