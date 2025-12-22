/**
 * AreaChartPanel - Generic area chart component
 * Pure presentational component with no store access.
 * Memoized to prevent unnecessary re-renders.
 */

import { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { useChartColors } from "./useChartColors";
import * as styles from "./charts.css";

interface AreaChartPanelProps {
  data: unknown[];
  xKey: string;
  yKey: string;
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
  gradientId?: string;
  color?: string;
  height?: number;
  className?: string;
}

/**
 * A responsive area chart with gradient fill.
 * Memoized to only re-render when data or configuration changes.
 */
export const AreaChartPanel = memo(function AreaChartPanel({
  data,
  xKey,
  yKey,
  xFormatter,
  yFormatter,
  gradientId = "areaGradient",
  color,
  height = 160,
  className = "",
}: AreaChartPanelProps) {
  const { gridColor, axisColor, primaryColor } = useChartColors();
  const areaColor = color ?? primaryColor;

  return (
    <div className={`${styles.chartWrapper} ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={areaColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xKey} stroke={axisColor} fontSize={10} tickFormatter={xFormatter} />
          <YAxis stroke={axisColor} fontSize={10} tickFormatter={yFormatter} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={areaColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
