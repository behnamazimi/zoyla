/**
 * Test Runner Feature Styles
 */

import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// Progress View
export const progressView = style({
  padding: vars.space.xxl,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  maxWidth: "800px",
  margin: "0 auto",
});

export const progressHeader = style({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: vars.space.lg,
  marginBottom: vars.space.xl,
});

export const progressTitle = style({
  fontSize: vars.font.size.xxl,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
});

export const progressPercent = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.xxxl,
  fontWeight: vars.font.weight.bold,
  color: vars.color.primary.base,
});

// Live Tiles Grid
export const liveMetricsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: vars.space.md,
});

export const liveTile = style({
  padding: vars.space.lg,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
  transition: `all ${vars.transition.fast}`,
});

export const liveTileVariants = styleVariants({
  default: {},
  accent: {
    background: vars.color.primary.subtle,
    borderColor: vars.color.primary.border,
  },
  success: {
    background: vars.color.success.subtle,
    borderColor: vars.color.success.border,
  },
  error: {
    background: vars.color.danger.subtle,
    borderColor: vars.color.danger.border,
  },
});

export const liveTileLabel = style({
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.medium,
  color: vars.color.text.muted,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
});

export const liveTileValue = style({
  fontFamily: vars.font.family.mono,
  fontSize: "24px",
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
});

export const liveTileValueVariants = styleVariants({
  default: {},
  highlight: { color: vars.color.primary.base },
  success: { color: vars.color.success.base },
  error: { color: vars.color.danger.base },
});

// Run Button
export const runButton = style({
  width: "100%",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.sm,
  fontFamily: "inherit",
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.semibold,
  background: vars.color.primary.base,
  color: vars.color.text.inverse,
  border: "none",
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  selectors: {
    "&:hover:not(:disabled)": {
      background: vars.color.primary.hover,
    },
    "&:active:not(:disabled)": {
      transform: "scale(0.98)",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
});

export const stopButton = style({
  width: "100%",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.sm,
  fontFamily: "inherit",
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.semibold,
  background: vars.color.danger.base,
  color: vars.color.text.inverse,
  border: "none",
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.danger.hover,
  },
  ":active": {
    transform: "scale(0.98)",
  },
});
