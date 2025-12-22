/**
 * Transform Utilities - Data transformations for charts
 * Includes downsampling for performance with large datasets.
 */

import type { LoadTestStats, HistogramBucket, LatencyPercentiles } from "../types/api";

// Maximum data points for chart rendering performance
const MAX_CHART_POINTS = 500;

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
 * Downsamples an array to a maximum number of points.
 * Uses uniform sampling to preserve data distribution.
 * Always includes first and last points for accurate range display.
 * @param data - Array to downsample
 * @param maxPoints - Maximum number of points to return
 * @returns Downsampled array
 */
function downsample<T>(data: T[], maxPoints: number = MAX_CHART_POINTS): T[] {
  if (data.length <= maxPoints) {
    return data;
  }

  const sampleRate = Math.ceil(data.length / maxPoints);
  const result: T[] = [];

  for (let i = 0; i < data.length; i++) {
    // Include point if it's at sample interval, first, or last
    if (i % sampleRate === 0 || i === data.length - 1) {
      result.push(data[i]);
    }
  }

  return result;
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
 * Downsamples to MAX_CHART_POINTS for performance with large datasets.
 * @param stats - Full test statistics
 * @returns Array of scatter plot data points (time_secs, request_index)
 */
export function transformRequestTimelineData(
  stats: LoadTestStats
): Array<{ time_secs: number; request_index: number }> {
  if (!stats.request_timeline || stats.request_timeline.length === 0) {
    return [];
  }

  // Downsample if needed for performance
  const sampled = downsample(stats.request_timeline);

  return sampled.map((point) => ({
    time_secs: point.time_secs,
    request_index: point.request_index,
  }));
}
