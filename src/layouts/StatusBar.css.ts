/**
 * StatusBar Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const statusBar = style({
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: vars.space.lg,
  paddingRight: vars.space.lg,
  background: "transparent",
  flexShrink: 0,
});

export const statusBarLeft = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const statusBarRight = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const versionText = style({
  fontSize: vars.font.size.sm,
  fontFamily: vars.font.family.mono,
  color: vars.color.text.muted,
  letterSpacing: vars.font.letterSpacing.wide,
});

export const authorLink = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
  textDecoration: "none",
  transition: `color ${vars.transition.fast}`,
  ":hover": {
    color: vars.color.primary.base,
  },
});
