/**
 * Settings Feature Styles
 */

import { style, globalStyle } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// Radix Popover Content
export const settingsPopoverContent = style({
  width: "260px",
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

export const layoutSettingsHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
});

globalStyle(`${layoutSettingsHeader} h3`, {
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
});

export const layoutSettingsClose = style({
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
  fontSize: vars.font.size.sm,
  transition: `all ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.bg.surfaceHover,
    color: vars.color.text.primary,
  },
});

export const layoutSettingsContent = style({
  padding: vars.space.lg,
});

export const layoutSettingsHint = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
  marginBottom: vars.space.md,
});

export const layoutToggles = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
});

export const layoutToggle = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `background ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.bg.surfaceHover,
  },
});

globalStyle(`${layoutToggle} input[type="checkbox"]`, {
  width: "14px",
  height: "14px",
  accentColor: vars.color.primary.base,
  cursor: "pointer",
});

export const layoutToggleLabel = style({
  fontSize: vars.font.size.base,
  color: vars.color.text.secondary,
  selectors: {
    [`${layoutToggle}:hover &`]: {
      color: vars.color.text.primary,
    },
  },
});

// Theme section styles
export const themeSection = style({
  marginBottom: vars.space.md,
});

export const themeToggleRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.sm,
  background: vars.color.bg.surface,
});

export const themeLabel = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.medium,
  color: vars.color.text.primary,
});

export const themeSwitch = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const themeSwitchLabel = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
});

export const switchRoot = style({
  width: "36px",
  height: "20px",
  backgroundColor: vars.color.bg.input,
  borderRadius: "10px",
  border: `1px solid ${vars.color.border.default}`,
  position: "relative",
  cursor: "pointer",
  transition: `background ${vars.transition.fast}`,
  selectors: {
    '&[data-state="checked"]': {
      backgroundColor: vars.color.primary.base,
      borderColor: vars.color.primary.base,
    },
  },
});

export const switchThumb = style({
  display: "block",
  width: "16px",
  height: "16px",
  backgroundColor: vars.color.switchThumb,
  borderRadius: "50%",
  boxShadow: vars.shadow.key,
  transition: `transform ${vars.transition.fast}`,
  transform: "translateX(1px)",
  selectors: {
    '&[data-state="checked"]': {
      transform: "translateX(17px)",
    },
  },
});

export const settingsDivider = style({
  height: "1px",
  background: vars.color.border.subtle,
  margin: `${vars.space.md} 0`,
});
