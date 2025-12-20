/**
 * ChartTooltip - Custom tooltip for recharts
 * Pure presentational component with no store access.
 */

import * as styles from "./charts.css";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: Record<string, unknown>; // For scatter charts, contains the full data point
  }>;
  label?: string | number;
  unit?: string;
  labelFormatter?: (label: string | number) => string;
  valueFormatter?: (value: number) => string;
  // For scatter charts: extract X and Y values from payload
  xKey?: string;
  xFormatter?: (value: number) => string;
  yKey?: string;
  yFormatter?: (value: number) => string;
}

/**
 * Formats a value with smart units.
 */
function formatValue(value: number, unit?: string): string {
  // For milliseconds, convert to seconds if >= 1000
  if (unit === "ms" && value >= 1000) {
    return `${(value / 1000).toFixed(2)}s`;
  }
  // Round to 2 decimal places
  const formatted = value >= 100 ? Math.round(value) : value.toFixed(2);
  return unit ? `${formatted} ${unit}` : String(formatted);
}

/**
 * Formats the label (typically x-axis value like time).
 */
function formatLabel(label: string | number | undefined): string {
  if (label === undefined) return "";
  if (typeof label === "number") {
    return label.toFixed(2);
  }
  return String(label);
}

/**
 * Custom tooltip component for recharts.
 * Shows clean, formatted values without redundant labels.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
  labelFormatter,
  valueFormatter,
  xKey,
  xFormatter,
  yKey,
  yFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const firstEntry = payload[0];

  // For scatter charts, extract X and Y values from payload data point
  let xValue: number | undefined;
  let yValue: number | undefined;

  if (firstEntry?.payload) {
    if (xKey) {
      const xVal = firstEntry.payload[xKey];
      if (typeof xVal === "number") {
        xValue = xVal;
      }
    }
    if (yKey) {
      const yVal = firstEntry.payload[yKey];
      if (typeof yVal === "number") {
        yValue = yVal;
      }
    }
  }

  // Format the label (X value for scatter charts)
  let formattedLabel: string;
  if (xValue !== undefined && xFormatter) {
    formattedLabel = xFormatter(xValue);
  } else if (xValue !== undefined && labelFormatter) {
    formattedLabel = labelFormatter(xValue);
  } else if (labelFormatter) {
    formattedLabel = labelFormatter(label ?? "");
  } else {
    formattedLabel = formatLabel(xValue !== undefined ? xValue : label);
  }

  return (
    <div className={styles.chartTooltip}>
      <p className={styles.chartTooltipLabel}>{formattedLabel}</p>
      {yValue !== undefined && yFormatter ? (
        // Scatter chart: show Y value with custom formatter
        <p className={styles.chartTooltipValue} style={{ color: firstEntry.color }}>
          {yFormatter(yValue)}
        </p>
      ) : (
        // Regular chart: show payload values
        payload.map((entry, index) => (
          <p key={index} className={styles.chartTooltipValue} style={{ color: entry.color }}>
            {valueFormatter ? valueFormatter(entry.value) : formatValue(entry.value, unit)}
          </p>
        ))
      )}
    </div>
  );
}
