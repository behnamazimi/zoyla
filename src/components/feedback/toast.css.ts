/**
 * Toast Component Styles
 */

import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

const slideIn = keyframes({
  from: {
    transform: "translateX(calc(100% + 24px))",
  },
  to: {
    transform: "translateX(0)",
  },
});

const slideOut = keyframes({
  from: {
    transform: "translateX(0)",
  },
  to: {
    transform: "translateX(calc(100% + 24px))",
  },
});

const swipeOut = keyframes({
  from: {
    transform: "translateX(var(--radix-toast-swipe-end-x))",
  },
  to: {
    transform: "translateX(calc(100% + 24px))",
  },
});

export const toastViewport = style({
  position: "fixed",
  bottom: 0,
  right: 0,
  display: "flex",
  flexDirection: "column",
  padding: vars.space.lg,
  gap: vars.space.sm,
  width: "380px",
  maxWidth: "100vw",
  margin: 0,
  listStyle: "none",
  zIndex: 2147483647,
  outline: "none",
});

export const toastRoot = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.space.md,
  padding: vars.space.md,
  background: vars.color.bg.surface,
  backdropFilter: "blur(20px)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  selectors: {
    '&[data-state="open"]': {
      animation: `${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    },
    '&[data-state="closed"]': {
      animation: `${slideOut} 100ms ease-in`,
    },
    '&[data-swipe="move"]': {
      transform: "translateX(var(--radix-toast-swipe-move-x))",
    },
    '&[data-swipe="cancel"]': {
      transform: "translateX(0)",
      transition: `transform ${vars.transition.fast}`,
    },
    '&[data-swipe="end"]': {
      animation: `${swipeOut} 100ms ease-out`,
    },
  },
});

export const toastError = style({
  background: vars.color.danger.subtle,
  borderColor: vars.color.danger.border,
});

export const toastIconWrapper = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "20px",
  height: "20px",
  color: vars.color.danger.base,
});

export const toastContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
  flex: 1,
  minWidth: 0,
});

export const toastTitle = style({
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
});

export const toastDescription = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.secondary,
  lineHeight: vars.font.lineHeight.normal,
  wordBreak: "break-word",
});

export const toastClose = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "24px",
  height: "24px",
  background: "transparent",
  border: "none",
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  color: vars.color.text.muted,
  transition: `all ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.bg.surfaceHover,
    color: vars.color.text.primary,
  },
});
