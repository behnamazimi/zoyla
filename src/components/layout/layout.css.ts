/**
 * Layout Component Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// Panel base
export const panel = style({
  background: vars.color.bg.surface,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  padding: vars.space.lg,
  position: "relative",
});

export const panelHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: vars.space.md,
});

export const panelTitle = style({
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  letterSpacing: vars.font.letterSpacing.wide,
  color: vars.color.text.secondary,
  margin: 0,
});

// Title with section indicator (colored bar before text)
export const panelTitleWithIndicator = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  letterSpacing: vars.font.letterSpacing.wide,
  color: vars.color.text.secondary,
  margin: 0,
  "::before": {
    content: '""',
    width: "3px",
    height: "14px",
    background: vars.color.primary.base,
    borderRadius: "2px",
    flexShrink: 0,
  },
});

export const panelTitleCollapsible = style({
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const collapseIcon = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.text.muted,
  flexShrink: 0,
});

export const panelActions = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const panelContent = style({
  // Content wrapper - allows for consistent spacing
});

// Resize Handle
export const resizeHandle = style({
  position: "absolute",
  top: 0,
  right: "-4px",
  width: "8px",
  height: "100%",
  cursor: "col-resize",
  zIndex: 10,
  transition: `background ${vars.transition.fast}`,
  "::after": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "4px",
    height: "40px",
    background: "transparent",
    borderRadius: "2px",
    transition: `background ${vars.transition.fast}`,
  },
  selectors: {
    "&:hover::after": {
      background: vars.color.primary.base,
    },
    "&:active::after": {
      background: vars.color.primary.base,
    },
  },
});

// Section title (standalone, for use outside Panel)
export const sectionTitle = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  letterSpacing: vars.font.letterSpacing.wide,
  color: vars.color.text.secondary,
  margin: 0,
  marginBottom: vars.space.md,
  "::before": {
    content: '""',
    width: "3px",
    height: "14px",
    background: vars.color.primary.base,
    borderRadius: "2px",
  },
});
