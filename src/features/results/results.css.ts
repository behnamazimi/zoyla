/**
 * Results Feature Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";
import { fadeIn } from "../../styles/global.css";

// Results Container
export const resultsContainer = style({
  padding: vars.space.xl,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xl,
  animation: `${fadeIn} 0.3s ease`,
});

export const resultsHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: vars.space.lg,
  marginBottom: vars.space.md,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
});

export const resultsTitleGroup = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.lg,
  flexWrap: "wrap",
});

export const resultsTitle = style({
  fontSize: vars.font.size.xxl,
  fontWeight: vars.font.weight.semibold,
  lineHeight: vars.font.lineHeight.tight,
  letterSpacing: vars.font.letterSpacing.tight,
  color: vars.color.text.primary,
  margin: 0,
});

export const resultsTimestamp = style({
  fontSize: vars.font.size.base,
  color: vars.color.text.muted,
  fontWeight: vars.font.weight.normal,
});

export const errorIndicator = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.danger.base,
  background: vars.color.danger.subtle,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  marginLeft: vars.space.sm,
});

export const resultsActions = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const clearResultsBtn = style({
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: vars.color.bg.input,
  color: vars.color.text.secondary,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  opacity: 0.85,
  ":hover": {
    opacity: 1,
    background: vars.color.danger.subtle,
    borderColor: vars.color.danger.border,
    color: vars.color.danger.base,
  },
  ":active": {
    transform: "scale(0.95)",
  },
});

// Summary Cards (content inside Panel)
export const summaryCards = style({
  display: "flex",
  gap: vars.space.md,
  flexWrap: "wrap",
});

// Radix DropdownMenu - Export
export const dropdownTrigger = style({
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: vars.color.bg.input,
  color: vars.color.text.secondary,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  opacity: 0.85,
  selectors: {
    "&:hover": {
      opacity: 1,
      background: vars.color.bg.surfaceHover,
      borderColor: vars.color.primary.base,
      color: vars.color.primary.base,
    },
    "&:active": {
      transform: "scale(0.95)",
    },
    '&[data-state="open"]': {
      opacity: 1,
      background: vars.color.bg.surfaceHover,
      borderColor: vars.color.primary.base,
      color: vars.color.primary.base,
    },
  },
});

export const dropdownContent = style({
  minWidth: "150px",
  background: vars.color.bg.overlay,
  backdropFilter: "blur(20px)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space.xs,
  zIndex: vars.zIndex.dropdown,
  animationDuration: "150ms",
  animationTimingFunction: "ease",
});

export const dropdownItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  fontSize: vars.font.size.base,
  color: vars.color.text.secondary,
  borderRadius: vars.radius.sm,
  outline: "none",
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  selectors: {
    "&[data-highlighted]": {
      background: vars.color.bg.surfaceHover,
      color: vars.color.text.primary,
    },
  },
});

// Status Codes (content inside Panel)
export const statusCodesList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.sm,
});

// Charts Grid
export const chartsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: vars.space.lg,
  "@media": {
    "(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

// ============================================
// Error Logs - Compact design
// ============================================

export const errorLogsSection = style({
  background: vars.color.bg.surface,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  overflow: "hidden",
});

export const errorLogsHeader = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  cursor: "pointer",
  background: vars.color.danger.subtle,
  borderBottom: `1px solid ${vars.color.danger.border}`,
  transition: `background ${vars.transition.fast}`,
  border: "none",
  width: "100%",
  textAlign: "left",
  ":hover": {
    background: vars.color.dangerHover,
  },
});

export const errorLogsCollapseIcon = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.danger.base,
  flexShrink: 0,
});

export const errorLogsTitleText = style({
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.danger.base,
});

export const errorCountBadge = style({
  background: vars.color.danger.base,
  color: vars.color.text.inverse,
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.bold,
  padding: "1px 6px",
  borderRadius: "8px",
  minWidth: "18px",
  textAlign: "center",
});

export const errorLogsContent = style({
  maxHeight: "200px",
  overflowY: "auto",
});

export const errorLogsList = style({
  display: "flex",
  flexDirection: "column",
});

export const errorLogEntry = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  fontSize: vars.font.size.sm,
  transition: `background ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.bg.surfaceHover,
  },
  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const errorLogTime = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.xs,
  color: vars.color.text.muted,
  minWidth: "50px",
});

export const errorLogStatus = style({
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.semibold,
  padding: "1px 6px",
  borderRadius: "3px",
  whiteSpace: "nowrap",
});

export const errorLogStatusNetwork = style({
  background: vars.color.danger.subtle,
  color: vars.color.danger.base,
});

export const errorLogStatusHttp = style({
  background: vars.color.warning.subtle,
  color: vars.color.warning.base,
});

export const errorLogStatusTimeout = style({
  background: vars.color.purple.subtle,
  color: vars.color.purple.base,
});

export const errorLogMessage = style({
  flex: 1,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.xs,
  color: vars.color.text.secondary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const errorLogDuration = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.xs,
  color: vars.color.text.muted,
  minWidth: "60px",
  textAlign: "right",
});
