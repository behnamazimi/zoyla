/**
 * BarChartPanel - Generic bar chart component
 * Pure presentational component with no store access.
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { useChartColors } from "./useChartColors";
import * as styles from "./charts.css";

interface BarChartPanelProps {
  data: unknown[];
  xKey: string;
  yKey: string;
  xFormatter?: (value: number | string) => string;
  color?: string;
  height?: number;
  className?: string;
}

/**
 * A responsive bar chart.
 */
export function BarChartPanel({
  data,
  xKey,
  yKey,
  xFormatter,
  color,
  height = 160,
  className = "",
}: BarChartPanelProps) {
  const { gridColor, axisColor, successColor } = useChartColors();
  const barColor = color ?? successColor;

  return (
    <div className={`${styles.chartWrapper} ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xKey} stroke={axisColor} fontSize={10} tickFormatter={xFormatter} />
          <YAxis stroke={axisColor} fontSize={10} />
          <Tooltip content={<ChartTooltip unit="requests" />} />
          <Bar dataKey={yKey} fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
