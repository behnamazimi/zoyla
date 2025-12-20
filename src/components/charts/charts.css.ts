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
