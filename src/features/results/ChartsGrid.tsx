/**
 * ChartsGrid - Grid of result charts
 * Container component connecting to stores.
 * Uses memoization to prevent unnecessary re-renders and data transformations.
 */

import { useRef, useMemo, memo } from "react";
import { useTestRunnerStore, useUIStore } from "../../store";
import { Panel } from "../../components/layout";
import {
  AreaChartPanel,
  LineChartPanel,
  BarChartPanel,
  ScatterChartPanel,
  useChartColors,
  ChartInfoButton,
} from "../../components/charts";
import {
  transformHistogramData,
  transformPercentileData,
  transformRequestTimelineData,
} from "../../utils/transform";
import { formatMs } from "../../utils/format";
import * as styles from "./results.css";
import * as chartStyles from "../../components/charts/charts.css";

/**
 * Displays all result charts based on layout settings.
 * Memoized to prevent unnecessary re-renders when unrelated state changes.
 */
export const ChartsGrid = memo(function ChartsGrid() {
  const stats = useTestRunnerStore((s) => s.stats);
  const layoutSettings = useUIStore((s) => s.layoutSettings);
  const { primaryColor, successColor, warningColor } = useChartColors();

  const throughputRef = useRef<HTMLDivElement>(null);
  const latencyRef = useRef<HTMLDivElement>(null);
  const histogramRef = useRef<HTMLDivElement>(null);
  const percentileRef = useRef<HTMLDivElement>(null);
  const correlationRef = useRef<HTMLDivElement>(null);

  // Memoize data transformations to avoid recalculating on every render
  const histogramData = useMemo(
    () => (stats ? transformHistogramData(stats.histogram) : []),
    [stats?.histogram]
  );

  const percentileData = useMemo(
    () => (stats ? transformPercentileData(stats.percentiles) : []),
    [stats?.percentiles]
  );

  const timelineData = useMemo(
    () => (stats ? transformRequestTimelineData(stats) : []),
    [stats?.request_timeline]
  );

  if (!stats) return null;

  return (
    <div className={styles.chartsGrid}>
      {/* Throughput Over Time */}
      {layoutSettings.showThroughputChart && (
        <Panel
          ref={throughputRef}
          title="Throughput Over Time"
          copyable
          copyTitle="Throughput Chart"
          headerAction={
            <ChartInfoButton
              title="Throughput Over Time"
              description="Shows requests per second (RPS) at different points during the test. Higher values indicate better performance."
              howToRead="The chart displays RPS over time. It starts at zero because requests take time to complete - the first few hundred milliseconds show 0 RPS until the first responses arrive. A steady high line means consistent performance. Dips indicate slowdowns. The area under the curve represents total throughput."
            />
          }
        >
          <AreaChartPanel
            data={stats.throughput_over_time}
            xKey="time_secs"
            yKey="rps"
            xFormatter={(v) => `${v.toFixed(1)}s`}
            gradientId="throughputGradient"
            color={primaryColor}
          />
        </Panel>
      )}

      {/* Latency Over Time */}
      {layoutSettings.showLatencyChart && (
        <Panel
          ref={latencyRef}
          title="Latency Over Time"
          copyable
          copyTitle="Latency Chart"
          headerAction={
            <ChartInfoButton
              title="Latency Over Time"
              description="Shows individual request response times as they occurred during the test. Lower values indicate faster responses."
              howToRead="Each point represents one request's latency. A flat line means consistent performance. Spikes indicate temporary slowdowns. Upward trends suggest performance degradation under load."
            />
          }
        >
          <LineChartPanel
            data={stats.latency_over_time}
            xKey="timestamp_ms"
            yKey="latency_ms"
            xFormatter={(v) => `${(v / 1000).toFixed(1)}s`}
            yFormatter={(v) => `${v.toFixed(0)}ms`}
            color={successColor}
          />
        </Panel>
      )}

      {/* Response Time Distribution */}
      {layoutSettings.showHistogram && (
        <Panel
          ref={histogramRef}
          title="Response Time Distribution"
          copyable
          copyTitle="Distribution Chart"
          headerAction={
            <ChartInfoButton
              title="Response Time Distribution"
              description="Shows how many requests fell into each latency range (bucket). Helps identify the most common response times."
              howToRead="Each bar represents a range of response times. Taller bars mean more requests in that range. A left-skewed distribution (taller bars on the left) indicates fast responses. Right-skewed means many slow requests."
            />
          }
        >
          <BarChartPanel
            data={histogramData}
            xKey="name"
            yKey="count"
            xFormatter={(v) => `${v}ms`}
            color={successColor}
          />
        </Panel>
      )}

      {/* Latency Percentiles */}
      {layoutSettings.showPercentiles && (
        <Panel
          ref={percentileRef}
          title="Latency Percentiles"
          copyable
          copyTitle="Percentiles Chart"
          headerAction={
            <ChartInfoButton
              title="Latency Percentiles"
              description="Shows response time percentiles (p10, p25, p50, p75, p90, p95, p99). Percentiles tell you what latency most users experience."
              howToRead="p50 (median) is the middle value - half of requests were faster. p90 means 90% of requests were faster. p99 shows the worst 1% of requests. Lower values are better. A steep curve indicates inconsistent performance."
            />
          }
        >
          <AreaChartPanel
            data={percentileData}
            xKey="label"
            yKey="value"
            yFormatter={(v) => `${v.toFixed(0)}ms`}
            gradientId="percentileGradient"
            color={warningColor}
          />
          <div className={chartStyles.percentileBadges}>
            <span className={chartStyles.percentileBadge}>
              p50: {formatMs(stats.percentiles.p50)}
            </span>
            <span className={chartStyles.percentileBadge}>
              p90: {formatMs(stats.percentiles.p90)}
            </span>
            <span className={chartStyles.percentileBadge}>
              p99: {formatMs(stats.percentiles.p99)}
            </span>
          </div>
        </Panel>
      )}

      {/* Request Timeline Chart */}
      {layoutSettings.showCorrelationChart && timelineData.length > 0 && (
        <Panel
          ref={correlationRef}
          title="Request Timeline"
          copyable
          copyTitle="Request Timeline Chart"
          headerAction={
            <ChartInfoButton
              title="Request Timeline"
              description="Shows when each request started relative to the test start time. Helps visualize request distribution and concurrency patterns."
              howToRead="Each point represents a request. X-axis is elapsed time, Y-axis is request number. A diagonal line means steady request rate. Gaps indicate pauses. Clustering shows bursts of activity."
            />
          }
        >
          <ScatterChartPanel
            data={timelineData}
            xKey="time_secs"
            yKey="request_index"
            xFormatter={(v) => `${v.toFixed(1)}s`}
            yFormatter={(v) => `#${v.toFixed(0)}`}
            xAxisName="Elapsed Time"
            yAxisName="Request Index"
            tooltipXFormatter={(value) => `Time: ${value.toFixed(2)}s`}
            tooltipYFormatter={(value) => `Request #${value.toFixed(0)}`}
            maxXValue={stats.total_time_secs}
            color={primaryColor}
          />
        </Panel>
      )}
    </div>
  );
});
