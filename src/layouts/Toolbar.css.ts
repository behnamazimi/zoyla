/**
 * Toolbar Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const toolbar = style({
  height: "52px",
  // Extra left padding for macOS traffic lights (close/minimize/maximize)
  paddingLeft: "8rem",
  paddingRight: vars.space.lg,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "transparent",
  // @ts-expect-error - WebkitAppRegion is a Tauri-specific property for window dragging
  WebkitAppRegion: "drag",
  flexShrink: 0,
});

export const toolbarLeft = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.xs,
  // Allow dragging from the title area too
  // @ts-expect-error - WebkitAppRegion is a Tauri-specific property for window dragging
  WebkitAppRegion: "drag",
});

export const appLogo = style({
  width: "24px",
  height: "24px",
  // @ts-expect-error - WebkitAppRegion is a Tauri-specific property for window dragging
  WebkitAppRegion: "drag",
});

export const appTitle = style({
  fontWeight: vars.font.weight.semibold,
  fontSize: vars.font.size.lg,
  letterSpacing: vars.font.letterSpacing.tight,
  color: vars.color.text.primary,
  // @ts-expect-error - WebkitAppRegion is a Tauri-specific property for window dragging
  WebkitAppRegion: "drag",
});

export const toolbarRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.md,
  // @ts-expect-error - WebkitAppRegion is a Tauri-specific property for window dragging
  WebkitAppRegion: "no-drag",
});

export const toolbarButton = style({
  position: "relative",
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  color: vars.color.text.secondary,
  ":hover": {
    background: vars.color.bg.surfaceHover,
    color: vars.color.text.primary,
  },
});

export const toolbarButtonActive = style({
  background: vars.color.primary.subtle,
  borderColor: vars.color.primary.border,
  color: vars.color.primary.base,
});

export const toolbarIcon = style({
  width: "16px",
  height: "16px",
});

export const toolbarBadge = style({
  position: "absolute",
  top: "-4px",
  right: "-4px",
  minWidth: "16px",
  height: "16px",
  padding: "0 4px",
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.inverse,
  background: vars.color.primary.base,
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const toolbarLink = style({
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  color: vars.color.text.secondary,
  textDecoration: "none",
  ":hover": {
    background: vars.color.bg.surfaceHover,
    color: vars.color.text.primary,
  },
});

export const toolbarDivider = style({
  width: "1px",
  height: "20px",
  background: vars.color.border.subtle,
  margin: `0 ${vars.space.xs}`,
});
