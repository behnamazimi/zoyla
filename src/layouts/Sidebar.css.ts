/**
 * Sidebar Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const sidebar = style({
  position: "relative",
  minWidth: "260px",
  maxWidth: "500px",
  background: vars.color.bg.content,
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.lg,
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  boxShadow: vars.shadow.lg,
});

export const sidebarForm = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
});

export const sidebarContent = style({
  flex: 1,
  padding: vars.space.lg,
  paddingBottom: 0,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.lg,
  overflowY: "auto",
});

export const sidebarFooter = style({
  padding: vars.space.lg,
  paddingTop: vars.space.md,
  borderTop: `1px solid ${vars.color.border.subtle}`,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
  borderRadius: `0 0 ${vars.radius.lg} ${vars.radius.lg}`,
});

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
