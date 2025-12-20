/**
 * Theme - Design tokens for the application
 * Defines colors, spacing, typography, and other design constants.
 *
 * Token naming follows semantic conventions:
 * - bg.*      : Background colors
 * - border.*  : Border colors
 * - text.*    : Text colors
 * - primary.* : Primary action colors (blue)
 * - success.* : Success state colors (green)
 * - warning.* : Warning state colors (orange)
 * - danger.*  : Error/danger state colors (red)
 * - info.*    : Info/highlight colors (yellow)
 */

import { createGlobalTheme, globalStyle } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    // === BACKGROUNDS ===
    bg: {
      app: "transparent",
      sidebar: "var(--bg-sidebar)",
      content: "var(--bg-content)",
      surface: "var(--bg-surface)",
      surfaceHover: "var(--bg-surface-hover)",
      input: "var(--bg-input)",
      inputFocus: "var(--bg-input-focus)",
      overlay: "var(--bg-overlay)",
    },

    // === BORDERS ===
    border: {
      subtle: "var(--border-subtle)",
      default: "var(--border-default)",
      focus: "var(--primary-base)",
    },

    // === TEXT ===
    text: {
      primary: "var(--text-primary)",
      secondary: "var(--text-secondary)",
      muted: "var(--text-muted)",
      inverse: "var(--text-inverse)",
    },

    // === SEMANTIC STATES ===
    primary: {
      base: "var(--primary-base)",
      hover: "var(--primary-hover)",
      light: "var(--primary-light)",
      subtle: "var(--primary-subtle)",
      ring: "var(--primary-ring)",
      border: "var(--primary-border)",
    },
    success: {
      base: "var(--success-base)",
      subtle: "var(--success-subtle)",
      glow: "var(--success-glow)",
      border: "var(--success-border)",
    },
    warning: {
      base: "var(--warning-base)",
      subtle: "var(--warning-subtle)",
      border: "var(--warning-border)",
    },
    danger: {
      base: "var(--danger-base)",
      hover: "var(--danger-hover-color)",
      subtle: "var(--danger-subtle)",
      glow: "var(--danger-glow)",
      border: "var(--danger-border)",
    },
    info: {
      base: "var(--info-base)",
      subtle: "var(--info-subtle)",
    },
    purple: {
      base: "var(--purple-base)",
      subtle: "var(--purple-subtle)",
    },
    // Switch thumb
    switchThumb: "var(--switch-thumb)",
    // Error glow
    errorGlowSm: "var(--error-glow-sm)",
    errorGlowLg: "var(--error-glow-lg)",
    // Danger hover
    dangerHover: "var(--danger-hover)",
    // Chart colors
    chart: {
      grid: "var(--chart-grid)",
      axis: "var(--chart-axis)",
    },
  },

  radius: {
    sm: "6px",
    md: "10px",
    lg: "12px",
  },

  space: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "32px",
  },

  font: {
    family: {
      system:
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
      mono: '"SF Mono", ui-monospace, monospace',
    },
    size: {
      xs: "10px",
      sm: "11px",
      md: "12px",
      base: "13px",
      lg: "14px",
      xl: "15px",
      xxl: "20px",
      xxxl: "24px",
      display: "28px",
    },
    weight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.2",
      normal: "1.4",
      relaxed: "1.6",
    },
    letterSpacing: {
      tight: "-0.02em",
      normal: "0",
      wide: "0.02em",
      caps: "0.06em",
    },
  },

  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    key: "var(--shadow-key)",
  },

  transition: {
    fast: "0.15s ease",
    normal: "0.2s ease",
  },

  zIndex: {
    base: "1",
    dropdown: "10",
    modal: "100",
  },
});

// Dark theme (default)
globalStyle(":root", {
  vars: {
    // Backgrounds
    "--bg-sidebar": "rgba(15, 15, 20, 0.75)",
    "--bg-content": "rgba(20, 20, 28, 0.65)",
    "--bg-surface": "rgba(255, 255, 255, 0.04)",
    "--bg-surface-hover": "rgba(255, 255, 255, 0.08)",
    "--bg-input": "rgba(255, 255, 255, 0.06)",
    "--bg-input-focus": "rgba(255, 255, 255, 0.1)",
    "--bg-overlay": "rgba(25, 25, 32, 0.92)",
    // Borders
    "--border-subtle": "rgba(255, 255, 255, 0.08)",
    "--border-default": "rgba(255, 255, 255, 0.12)",
    // Text
    "--text-primary": "rgba(255, 255, 255, 0.88)",
    "--text-secondary": "rgba(255, 255, 255, 0.55)",
    "--text-muted": "rgba(255, 255, 255, 0.35)",
    "--text-inverse": "#ffffff",
    // Primary (blue)
    "--primary-base": "#0a84ff",
    "--primary-hover": "#0077ed",
    "--primary-light": "#5ac8fa",
    "--primary-subtle": "rgba(10, 132, 255, 0.15)",
    "--primary-ring": "rgba(10, 132, 255, 0.2)",
    "--primary-border": "rgba(10, 132, 255, 0.3)",
    // Success (green)
    "--success-base": "#30d158",
    "--success-subtle": "rgba(48, 209, 88, 0.15)",
    "--success-glow": "rgba(48, 209, 88, 0.5)",
    "--success-border": "rgba(48, 209, 88, 0.25)",
    // Warning (orange)
    "--warning-base": "#ff9f0a",
    "--warning-subtle": "rgba(255, 159, 10, 0.15)",
    "--warning-border": "rgba(255, 159, 10, 0.25)",
    // Danger (red)
    "--danger-base": "#ff453a",
    "--danger-hover-color": "#e63939",
    "--danger-subtle": "rgba(255, 69, 58, 0.15)",
    "--danger-glow": "rgba(255, 69, 58, 0.5)",
    "--danger-border": "rgba(255, 69, 58, 0.25)",
    // Info (yellow)
    "--info-base": "#ffd60a",
    "--info-subtle": "rgba(255, 214, 10, 0.15)",
    // Shadows (dark theme uses darker shadows)
    "--shadow-sm": "0 2px 8px rgba(0, 0, 0, 0.3)",
    "--shadow-md": "0 4px 12px rgba(0, 0, 0, 0.4)",
    "--shadow-lg": "0 8px 32px rgba(0, 0, 0, 0.5)",
    "--shadow-key": "0 1px 0 rgba(0, 0, 0, 0.4)",
    // Danger hover (for backgrounds)
    "--danger-hover": "rgba(255, 69, 58, 0.2)",
    // Purple/timeout color
    "--purple-subtle": "rgba(168, 85, 247, 0.15)",
    "--purple-base": "rgb(168, 85, 247)",
    // Switch thumb color (always white in dark mode)
    "--switch-thumb": "#ffffff",
    // Error glow for animations
    "--error-glow-sm": "0 0 8px rgba(255, 69, 58, 0.3)",
    "--error-glow-lg": "0 0 16px rgba(255, 69, 58, 0.5)",
    // Chart colors
    "--chart-grid": "rgba(255, 255, 255, 0.06)",
    "--chart-axis": "rgba(255, 255, 255, 0.3)",
    // App background gradient (dark)
    "--app-bg-gradient": `
      radial-gradient(ellipse 90% 80% at 110% 50%, rgba(120, 60, 180, 0.35) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at -10% 40%, rgba(80, 140, 220, 0.25) 0%, transparent 55%),
      linear-gradient(180deg, #0f0f14 0%, #0a0a0f 100%)
    `,
  },
});

// Light theme
globalStyle(':root[data-theme="light"]', {
  vars: {
    // Backgrounds
    "--bg-sidebar": "rgba(255, 255, 255, 0.85)",
    "--bg-content": "rgba(255, 255, 255, 0.80)",
    "--bg-surface": "rgba(0, 0, 0, 0.03)",
    "--bg-surface-hover": "rgba(0, 0, 0, 0.06)",
    "--bg-input": "rgba(0, 0, 0, 0.05)",
    "--bg-input-focus": "rgba(0, 0, 0, 0.08)",
    "--bg-overlay": "rgba(255, 255, 255, 0.95)",
    // Borders
    "--border-subtle": "rgba(0, 0, 0, 0.10)",
    "--border-default": "rgba(0, 0, 0, 0.15)",
    // Text
    "--text-primary": "rgba(0, 0, 0, 0.87)",
    "--text-secondary": "rgba(0, 0, 0, 0.60)",
    "--text-muted": "rgba(0, 0, 0, 0.45)",
    "--text-inverse": "#ffffff",
    // Primary (blue - darker for light mode contrast)
    "--primary-base": "#0066cc",
    "--primary-hover": "#0055aa",
    "--primary-light": "#3399ff",
    "--primary-subtle": "rgba(0, 102, 204, 0.12)",
    "--primary-ring": "rgba(0, 102, 204, 0.25)",
    "--primary-border": "rgba(0, 102, 204, 0.35)",
    // Success (green - darker for light mode contrast)
    "--success-base": "#1a9f41",
    "--success-subtle": "rgba(26, 159, 65, 0.12)",
    "--success-glow": "rgba(26, 159, 65, 0.3)",
    "--success-border": "rgba(26, 159, 65, 0.30)",
    // Warning (orange - darker for light mode contrast)
    "--warning-base": "#cc7a00",
    "--warning-subtle": "rgba(204, 122, 0, 0.12)",
    "--warning-border": "rgba(204, 122, 0, 0.30)",
    // Danger (red - darker for light mode contrast)
    "--danger-base": "#d93025",
    "--danger-hover-color": "#c42b21",
    "--danger-subtle": "rgba(217, 48, 37, 0.10)",
    "--danger-glow": "rgba(217, 48, 37, 0.3)",
    "--danger-border": "rgba(217, 48, 37, 0.30)",
    // Info (yellow/gold - darker for light mode contrast)
    "--info-base": "#b8860b",
    "--info-subtle": "rgba(184, 134, 11, 0.12)",
    // Shadows (light theme uses softer shadows)
    "--shadow-sm": "0 2px 8px rgba(0, 0, 0, 0.08)",
    "--shadow-md": "0 4px 12px rgba(0, 0, 0, 0.12)",
    "--shadow-lg": "0 8px 32px rgba(0, 0, 0, 0.15)",
    "--shadow-key": "0 1px 0 rgba(0, 0, 0, 0.12)",
    // Danger hover (for backgrounds)
    "--danger-hover": "rgba(217, 48, 37, 0.15)",
    // Purple/timeout color (darker for light mode)
    "--purple-subtle": "rgba(124, 58, 237, 0.12)",
    "--purple-base": "#7c3aed",
    // Switch thumb color
    "--switch-thumb": "#ffffff",
    // Error glow for animations
    "--error-glow-sm": "0 0 8px rgba(217, 48, 37, 0.2)",
    "--error-glow-lg": "0 0 16px rgba(217, 48, 37, 0.35)",
    // Chart colors
    "--chart-grid": "rgba(0, 0, 0, 0.08)",
    "--chart-axis": "rgba(0, 0, 0, 0.35)",
    // App background gradient (light)
    "--app-bg-gradient": `
      radial-gradient(ellipse 90% 80% at 110% 50%, rgba(180, 140, 220, 0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at -10% 40%, rgba(140, 180, 240, 0.15) 0%, transparent 55%),
      linear-gradient(180deg, #f5f5fa 0%, #e8e8f0 100%)
    `,
  },
});
