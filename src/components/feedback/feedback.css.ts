/**
 * Feedback Component Styles
 */

import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";
import { pulse } from "../../styles/global.css";

// Progress Bar
export const progressBarLarge = style({
  width: "100%",
  height: "32px",
  background: vars.color.bg.input,
  borderRadius: vars.radius.sm,
  overflow: "hidden",
  marginBottom: vars.space.xl,
  border: `1px solid ${vars.color.border.subtle}`,
});

export const progressBarFill = style({
  height: "100%",
  background: `linear-gradient(90deg, ${vars.color.primary.base} 0%, ${vars.color.primary.light} 100%)`,
  borderRadius: vars.radius.sm,
  transition: "width 0.1s ease-out",
  boxShadow: `0 0 20px ${vars.color.primary.ring}`,
});

// Summary Card
export const summaryCard = style({
  flex: 1,
  minWidth: "140px",
  padding: vars.space.md,
  background: vars.color.bg.input,
  borderRadius: vars.radius.sm,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
  justifyContent: "space-between",
});

export const summaryCardAccent = style({
  background: vars.color.primary.subtle,
});

export const summaryCardWarning = style({
  background: vars.color.warning.subtle,
});

export const summaryCardValue = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.xxxl,
  fontWeight: vars.font.weight.semibold,
  lineHeight: vars.font.lineHeight.tight,
  letterSpacing: vars.font.letterSpacing.tight,
  color: vars.color.text.primary,
  selectors: {
    [`${summaryCardAccent} &`]: {
      color: vars.color.primary.base,
    },
  },
});

export const summaryCardValueWarning = style({
  color: vars.color.warning.base,
});

export const summaryCardLabel = style({
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.muted,
  textTransform: "uppercase",
  letterSpacing: vars.font.letterSpacing.caps,
});

// Status Code Badge - Enhanced with icons and better visual hierarchy
export const statusCodeItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  padding: `${vars.space.md} ${vars.space.lg}`,
  background: vars.color.bg.input,
  borderRadius: vars.radius.md,
  transition: `all ${vars.transition.fast}`,
});

export const statusCodeItemVariants = styleVariants({
  success: {
    borderLeftColor: vars.color.success.base,
    background: vars.color.success.subtle,
  },
  redirect: {
    borderLeftColor: vars.color.info.base,
    background: vars.color.info.subtle,
  },
  clientError: {
    borderLeftColor: vars.color.warning.base,
    background: vars.color.warning.subtle,
  },
  serverError: {
    borderLeftColor: vars.color.danger.base,
    background: vars.color.danger.subtle,
  },
  unknown: {
    borderLeftColor: vars.color.danger.base,
    background: vars.color.danger.subtle,
  },
});

export const statusCodeBadge = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.xs,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.lg,
  fontWeight: vars.font.weight.bold,
  padding: "4px 10px",
  borderRadius: vars.radius.sm,
});

export const statusCodeIcon = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const statusCodeBadgeVariants = styleVariants({
  success: {
    color: vars.color.success.base,
    background: vars.color.success.subtle,
  },
  redirect: {
    color: vars.color.info.base,
    background: vars.color.info.subtle,
  },
  clientError: {
    color: vars.color.warning.base,
    background: vars.color.warning.subtle,
  },
  serverError: {
    color: vars.color.danger.base,
    background: vars.color.danger.subtle,
  },
  unknown: {
    color: vars.color.danger.base,
    background: vars.color.danger.subtle,
  },
});

export const statusCodeCount = style({
  fontSize: vars.font.size.base,
  color: vars.color.text.secondary,
  fontWeight: vars.font.weight.medium,
});

// Status Dot
export const statusDot = style({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  flexShrink: 0,
});

export const statusDotVariants = styleVariants({
  idle: {
    background: vars.color.text.muted,
  },
  success: {
    background: vars.color.success.base,
    boxShadow: `0 0 6px ${vars.color.success.glow}`,
  },
  error: {
    background: vars.color.danger.base,
    boxShadow: `0 0 6px ${vars.color.danger.glow}`,
  },
  running: {
    background: vars.color.warning.base,
    boxShadow: `0 0 6px ${vars.color.warning.subtle}`,
    animation: `${pulse} 1.5s ease-in-out infinite`,
  },
});

// Error Box
export const errorBox = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: `${vars.space.md} ${vars.space.md}`,
  background: vars.color.danger.subtle,
  border: `1px solid ${vars.color.danger.border}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.font.size.base,
  color: vars.color.danger.base,
});

export const errorDismiss = style({
  marginLeft: "auto",
  background: "transparent",
  border: "none",
  color: vars.color.danger.base,
  cursor: "pointer",
  padding: vars.space.xs,
  opacity: 0.7,
  ":hover": {
    opacity: 1,
  },
});

// Live Progress Tiles
export const liveTiles = style({
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

export const liveTileValue = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.display,
  fontWeight: vars.font.weight.semibold,
  lineHeight: vars.font.lineHeight.tight,
  letterSpacing: vars.font.letterSpacing.tight,
  color: vars.color.text.primary,
});

export const liveTileValueVariants = styleVariants({
  accent: { color: vars.color.primary.base },
  success: { color: vars.color.success.base },
  error: { color: vars.color.danger.base },
});

export const liveTileTotal = style({
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.medium,
  color: vars.color.text.muted,
});

export const liveTileLabel = style({
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.muted,
  textTransform: "uppercase",
  letterSpacing: vars.font.letterSpacing.caps,
});
