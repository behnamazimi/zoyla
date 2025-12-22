/**
 * LineChartPanel - Generic line chart component
 * Pure presentational component with no store access.
 * Memoized to prevent unnecessary re-renders.
 */

import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { useChartColors } from "./useChartColors";
import * as styles from "./charts.css";

interface LineChartPanelProps {
  data: unknown[];
  xKey: string;
  yKey: string;
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
  color?: string;
  height?: number;
  className?: string;
}

/**
 * A responsive line chart.
 * Memoized to only re-render when data or configuration changes.
 */
export const LineChartPanel = memo(function LineChartPanel({
  data,
  xKey,
  yKey,
  xFormatter,
  yFormatter,
  color,
  height = 160,
  className = "",
}: LineChartPanelProps) {
  const { gridColor, axisColor, successColor } = useChartColors();
  const lineColor = color ?? successColor;

  return (
    <div className={`${styles.chartWrapper} ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xKey} stroke={axisColor} fontSize={10} tickFormatter={xFormatter} />
          <YAxis stroke={axisColor} fontSize={10} tickFormatter={yFormatter} />
          <Tooltip content={<ChartTooltip unit="ms" />} />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
