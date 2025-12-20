/**
 * Charts Components Index - Recharts wrappers
 *
 * Pure presentational components for data visualization.
 * Wrap recharts components with consistent styling.
 *
 * @module components/charts
 */

/** Custom tooltip for all charts */
export { ChartTooltip } from "./ChartTooltip";

/** Area chart with gradient fill (throughput, percentiles) */
export { AreaChartPanel } from "./AreaChartPanel";

/** Line chart for time series (latency) */
export { LineChartPanel } from "./LineChartPanel";

/** Bar chart for distributions (histogram) */
export { BarChartPanel } from "./BarChartPanel";

/** Scatter chart with trend line for correlation analysis */
export { ScatterChartPanel } from "./ScatterChartPanel";

/** Hook for theme-aware chart colors */
export { useChartColors } from "./useChartColors";
