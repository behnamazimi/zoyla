/**
 * Button Component Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";
import { spin } from "../../styles/global.css";

// Base button styles
const baseButton = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "inherit",
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  border: "none",
  ":active:not(:disabled)": {
    transform: "scale(0.98)",
  },
  ":disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

// Primary button (Run)
export const runButton = style({
  ...baseButton,
  width: "100%",
  height: "40px",
  gap: vars.space.sm,
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.semibold,
  background: vars.color.primary.base,
  color: vars.color.text.inverse,
  borderRadius: vars.radius.sm,
  selectors: {
    "&:hover:not(:disabled)": {
      background: vars.color.primary.hover,
    },
  },
});

// Danger button (Stop)
export const stopButton = style({
  ...baseButton,
  width: "100%",
  height: "40px",
  gap: vars.space.sm,
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.semibold,
  background: vars.color.danger.base,
  color: vars.color.text.inverse,
  borderRadius: vars.radius.sm,
  ":hover": {
    background: vars.color.danger.hover,
  },
});

// Secondary button (Export)
export const exportButton = style({
  ...baseButton,
  flex: 1,
  height: "32px",
  gap: vars.space.sm,
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.medium,
  background: vars.color.primary.subtle,
  color: vars.color.primary.base,
  border: `1px solid ${vars.color.primary.ring}`,
  borderRadius: vars.radius.sm,
  ":hover": {
    background: vars.color.primary.ring,
    borderColor: vars.color.primary.border,
  },
});

// Ghost button (Clear)
export const clearButton = style({
  ...baseButton,
  width: "100%",
  height: "36px",
  gap: vars.space.sm,
  fontSize: vars.font.size.lg,
  fontWeight: vars.font.weight.medium,
  background: "transparent",
  color: vars.color.text.secondary,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  ":hover": {
    background: vars.color.bg.surface,
    color: vars.color.text.primary,
  },
});

// Export buttons container
export const exportButtons = style({
  display: "flex",
  gap: vars.space.sm,
});

export const exportIcon = style({
  width: "12px",
  height: "12px",
});

// Toolbar button
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

// Copy button - Enhanced with better feedback
export const copyButton = style({
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
  ":hover": {
    opacity: 1,
    background: vars.color.primary.subtle,
    borderColor: vars.color.primary.base,
    transform: "scale(1.05)",
  },
  ":active": {
    transform: "scale(0.95)",
  },
});

export const copyButtonCopied = style({
  background: vars.color.success.subtle,
  borderColor: vars.color.success.base,
  opacity: 1,
});

export const copyButtonCopying = style({
  opacity: 0.7,
  cursor: "wait",
});

export const copyIcon = style({
  width: "14px",
  height: "14px",
  color: vars.color.text.secondary,
  transition: `all ${vars.transition.fast}`,
  selectors: {
    [`${copyButton}:hover &`]: {
      color: vars.color.primary.base,
    },
    [`${copyButtonCopied} &`]: {
      color: vars.color.success.base,
    },
  },
});

export const copySpinner = style({
  width: "12px",
  height: "12px",
  border: `2px solid ${vars.color.primary.ring}`,
  borderTopColor: vars.color.primary.base,
  borderRadius: "50%",
  animation: `${spin} 0.6s linear infinite`,
});

// Spinner
export const spinner = style({
  width: "16px",
  height: "16px",
  border: `2px solid ${vars.color.primary.ring}`,
  borderTopColor: vars.color.text.inverse,
  borderRadius: "50%",
  animation: `${spin} 0.8s linear infinite`,
});

// Button icon
export const buttonIcon = style({
  fontSize: vars.font.size.sm,
});

// Radix Tooltip styles
export const tooltipContent = style({
  padding: `${vars.space.xs} ${vars.space.sm}`,
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.medium,
  color: vars.color.text.primary,
  background: vars.color.bg.overlay,
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.md,
  zIndex: vars.zIndex.modal,
  animationDuration: "150ms",
  animationTimingFunction: "ease",
});

export const tooltipArrow = style({
  fill: vars.color.bg.overlay,
});
