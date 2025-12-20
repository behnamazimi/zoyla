/**
 * Keyboard Shortcuts Feature Styles
 */

import { style, globalStyle } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// Radix Popover Content
export const shortcutsPopoverContent = style({
  width: "280px",
  background: vars.color.bg.overlay,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  zIndex: vars.zIndex.dropdown,
  animationDuration: "150ms",
  animationTimingFunction: "ease",
});

export const shortcutsHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
});

globalStyle(`${shortcutsHeader} h3`, {
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
});

export const shortcutsCloseBtn = style({
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: vars.radius.sm,
  color: vars.color.text.muted,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.bg.surfaceHover,
    color: vars.color.text.primary,
  },
});

export const shortcutsContent = style({
  padding: vars.space.md,
});

export const shortcutList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
});

export const shortcutRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
});

export const shortcutKeys = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.xs,
});

export const shortcutKey = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "22px",
  height: "20px",
  padding: `0 ${vars.space.xs}`,
  fontSize: vars.font.size.sm,
  fontFamily: vars.font.family.mono,
  fontWeight: vars.font.weight.medium,
  color: vars.color.text.secondary,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: "4px",
  boxShadow: vars.shadow.key,
});

export const shortcutPlus = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
  marginRight: vars.space.xs,
});

export const shortcutDescription = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
  textAlign: "right",
});
