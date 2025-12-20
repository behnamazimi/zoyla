/**
 * ScatterChartPanel - Scatter plot with optional trend line
 * Pure presentational component with no store access.
 */

import {
  ScatterChart,
  Scatter,
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

interface ScatterChartPanelProps {
  data: unknown[];
  xKey: string;
  yKey: string;
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
  xAxisName?: string;
  yAxisName?: string;
  tooltipUnit?: string;
  tooltipLabelFormatter?: (label: string | number) => string;
  tooltipValueFormatter?: (value: number) => string;
  tooltipXFormatter?: (value: number) => string;
  tooltipYFormatter?: (value: number) => string;
  trendLineData?: unknown[];
  correlationCoefficient?: number;
  color?: string;
  height?: number;
  className?: string;
  maxXValue?: number; // Optional max X value to ensure full range is shown
}

/**
 * A responsive scatter plot with optional trend line overlay.
 */
export function ScatterChartPanel({
  data,
  xKey,
  yKey,
  xFormatter,
  yFormatter,
  xAxisName,
  yAxisName,
  tooltipUnit,
  tooltipLabelFormatter,
  tooltipValueFormatter,
  tooltipXFormatter,
  tooltipYFormatter,
  trendLineData,
  correlationCoefficient,
  color,
  height = 160,
  className = "",
  maxXValue,
}: ScatterChartPanelProps) {
  const { gridColor, axisColor, successColor } = useChartColors();
  const scatterColor = color ?? successColor;

  // Determine X-axis domain: start at 0, end at maxXValue or dataMax
  const xDomain: [number, number] | [number, "dataMax"] =
    maxXValue !== undefined ? [0, maxXValue] : [0, "dataMax"];

  return (
    <div className={`${styles.chartWrapper} ${className}`}>
      {correlationCoefficient !== undefined && (
        <div className={styles.correlationBadge}>r = {correlationCoefficient.toFixed(3)}</div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            type="number"
            dataKey={xKey}
            stroke={axisColor}
            fontSize={10}
            tickFormatter={xFormatter || ((v) => String(v))}
            name={xAxisName}
            domain={xDomain}
            allowDataOverflow={false}
            allowDecimals={true}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            stroke={axisColor}
            fontSize={10}
            tickFormatter={yFormatter}
            name={yAxisName}
          />
          <Tooltip
            content={
              <ChartTooltip
                unit={tooltipUnit}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
                xKey={xKey}
                xFormatter={tooltipXFormatter || tooltipLabelFormatter || xFormatter}
                yKey={yKey}
                yFormatter={tooltipYFormatter || tooltipValueFormatter || yFormatter}
              />
            }
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter name="Requests" data={data} fill={scatterColor} fillOpacity={0.6} />
          {trendLineData && trendLineData.length > 0 && (
            <Line
              type="linear"
              dataKey={yKey}
              data={trendLineData}
              stroke={scatterColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Trend Line"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
