/**
 * Chart Component Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// Chart panel container
export const chartPanel = style({
  background: vars.color.bg.surface,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  padding: vars.space.lg,
  position: "relative",
});

export const chartPanelHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: vars.space.md,
});

export const chartTitle = style({
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  letterSpacing: vars.font.letterSpacing.wide,
  color: vars.color.text.secondary,
  marginBottom: 0,
});

export const chartTitleCollapsible = style({
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const collapseIcon = style({
  fontSize: "8px",
  color: vars.color.text.muted,
});

export const chartWrapper = style({
  margin: "0 -8px",
});

// Chart tooltip
export const chartTooltip = style({
  background: vars.color.bg.overlay,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  boxShadow: vars.shadow.md,
});

export const chartTooltipLabel = style({
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.secondary,
  marginBottom: vars.space.xs,
});

export const chartTooltipValue = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.medium,
  margin: "2px 0",
});

// Charts grid
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

// Percentile badges
export const percentileBadges = style({
  display: "flex",
  justifyContent: "center",
  gap: vars.space.md,
  marginTop: vars.space.md,
  paddingTop: vars.space.md,
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

export const percentileBadge = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.medium,
  color: vars.color.warning.base,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  background: vars.color.warning.subtle,
  borderRadius: "4px",
});

export const correlationBadge = style({
  position: "absolute",
  top: vars.space.md,
  right: vars.space.md,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.secondary,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  background: vars.color.bg.overlay,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.sm,
  zIndex: 10,
});

// Chart info button - matches copy button style
export const chartInfoButton = style({
  position: "relative",
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.normal}`,
  opacity: 0.5,
  padding: 0,
  ":hover": {
    opacity: 1,
    background: vars.color.primary.subtle,
    borderColor: vars.color.primary.base,
    transform: "scale(1.05)",
  },
  ":active": {
    transform: "scale(0.95)",
  },
  ":focus-visible": {
    outline: `2px solid ${vars.color.primary.base}`,
    outlineOffset: "2px",
  },
});

export const chartInfoIcon = style({
  width: "14px",
  height: "14px",
  color: vars.color.text.secondary,
  transition: `all ${vars.transition.fast}`,
  selectors: {
    [`${chartInfoButton}:hover &`]: {
      color: vars.color.primary.base,
    },
  },
});

// Chart info popover
export const chartInfoPopover = style({
  background: vars.color.bg.overlay,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  padding: 0,
  boxShadow: vars.shadow.lg,
  maxWidth: "320px",
  zIndex: vars.zIndex.dropdown,
  animationDuration: "150ms",
  animationTimingFunction: "ease",
});

export const chartInfoContent = style({
  padding: vars.space.md,
});

export const chartInfoTitle = style({
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
  margin: `0 0 ${vars.space.sm} 0`,
});

export const chartInfoDescription = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.secondary,
  lineHeight: vars.font.lineHeight.relaxed,
  margin: `0 0 ${vars.space.md} 0`,
});

export const chartInfoSection = style({
  marginTop: vars.space.md,
  paddingTop: vars.space.md,
  borderTop: `1px solid ${vars.color.border.subtle}`,
});

export const chartInfoLabel = style({
  display: "block",
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
  marginBottom: vars.space.xs,
});

export const chartInfoText = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.secondary,
  lineHeight: vars.font.lineHeight.relaxed,
  margin: 0,
});

export const chartInfoArrow = style({
  fill: vars.color.bg.overlay,
  stroke: vars.color.border.default,
  strokeWidth: 1,
});
