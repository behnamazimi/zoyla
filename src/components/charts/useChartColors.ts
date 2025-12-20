/**
 * useChartColors - Hook to get theme-aware chart colors
 */

import { useUIStore } from "../../store";

// Dark theme colors
const DARK_COLORS = {
  gridColor: "rgba(255, 255, 255, 0.06)",
  axisColor: "rgba(255, 255, 255, 0.3)",
  primaryColor: "#0a84ff",
  successColor: "#30d158",
  warningColor: "#ff9f0a",
  dangerColor: "#ff453a",
};

// Light theme colors
const LIGHT_COLORS = {
  gridColor: "rgba(0, 0, 0, 0.08)",
  axisColor: "rgba(0, 0, 0, 0.35)",
  primaryColor: "#0066cc",
  successColor: "#1a9f41",
  warningColor: "#cc7a00",
  dangerColor: "#d93025",
};

/**
 * Returns theme-aware colors for Recharts components.
 */
export function useChartColors() {
  const theme = useUIStore((s) => s.theme);
  return theme === "light" ? LIGHT_COLORS : DARK_COLORS;
}
