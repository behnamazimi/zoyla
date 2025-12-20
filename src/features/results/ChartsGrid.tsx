/**
 * ChartsGrid - Grid of result charts
 * Container component connecting to stores.
 */

import { useRef } from "react";
import { useTestRunnerStore, useUIStore } from "../../store";
import { Panel } from "../../components/layout";
import {
  AreaChartPanel,
  LineChartPanel,
  BarChartPanel,
  ScatterChartPanel,
  useChartColors,
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
 */
export function ChartsGrid() {
  const stats = useTestRunnerStore((s) => s.stats);
  const layoutSettings = useUIStore((s) => s.layoutSettings);
  const { primaryColor, successColor, warningColor } = useChartColors();

  const throughputRef = useRef<HTMLDivElement>(null);
  const latencyRef = useRef<HTMLDivElement>(null);
  const histogramRef = useRef<HTMLDivElement>(null);
  const percentileRef = useRef<HTMLDivElement>(null);
  const correlationRef = useRef<HTMLDivElement>(null);

  if (!stats) return null;

  const histogramData = transformHistogramData(stats.histogram);
  const percentileData = transformPercentileData(stats.percentiles);
  const timelineData = transformRequestTimelineData(stats);

  return (
    <div className={styles.chartsGrid}>
      {/* Throughput Over Time */}
      {layoutSettings.showThroughputChart && (
        <Panel
          ref={throughputRef}
          title="Throughput Over Time"
          copyable
          copyTitle="Throughput Chart"
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
        <Panel ref={latencyRef} title="Latency Over Time" copyable copyTitle="Latency Chart">
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
}
