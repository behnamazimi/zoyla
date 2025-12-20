/**
 * Test Config Feature Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// Method + URL row
export const methodUrlRow = style({
  display: "flex",
  gap: vars.space.sm,
});

// Radix Select - Trigger
export const selectTrigger = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.xs,
  width: "82px",
  height: "36px",
  padding: `0 ${vars.space.sm}`,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  outline: "none",
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  selectors: {
    "&:hover:not([data-disabled])": {
      background: vars.color.bg.inputFocus,
      borderColor: vars.color.border.default,
    },
    "&:focus": {
      background: vars.color.bg.inputFocus,
      borderColor: vars.color.border.focus,
      boxShadow: `0 0 0 3px ${vars.color.primary.ring}`,
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    "&[data-placeholder]": {
      color: vars.color.text.muted,
    },
  },
});

export const selectIcon = style({
  color: vars.color.text.muted,
  flexShrink: 0,
});

// Radix Select - Content (dropdown)
export const selectContent = style({
  overflow: "hidden",
  background: vars.color.bg.overlay,
  backdropFilter: "blur(20px)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  zIndex: vars.zIndex.dropdown,
});

export const selectViewport = style({
  padding: vars.space.xs,
});

// Radix Select - Item
export const selectItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.secondary,
  borderRadius: vars.radius.sm,
  outline: "none",
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  selectors: {
    "&[data-highlighted]": {
      background: vars.color.bg.surfaceHover,
      color: vars.color.text.primary,
    },
    '&[data-state="checked"]': {
      color: vars.color.primary.base,
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

export const selectItemIndicator = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  color: vars.color.primary.base,
});

export const urlInput = style({
  flex: 1,
  minWidth: 0,
  height: "36px",
  padding: `0 ${vars.space.md}`,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.base,
  color: vars.color.text.primary,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  outline: "none",
  transition: `all ${vars.transition.fast}`,
  "::placeholder": {
    color: vars.color.text.muted,
  },
  ":focus": {
    background: vars.color.bg.inputFocus,
    borderColor: vars.color.border.focus,
    boxShadow: `0 0 0 3px ${vars.color.primary.ring}`,
  },
  ":disabled": {
    opacity: 0.5,
  },
});

// Config section
export const configSection = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
});

export const configLabel = style({
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.secondary,
  textTransform: "uppercase",
  letterSpacing: vars.font.letterSpacing.caps,
});

// Load config row (requests + concurrency side by side)
export const loadConfigRow = style({
  display: "flex",
  gap: vars.space.md,
});

export const labeledInputGroup = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
});

export const labeledNumberInput = style({
  width: "100%",
  height: "36px",
  padding: `0 ${vars.space.md}`,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  outline: "none",
  transition: `all ${vars.transition.fast}`,
  ":focus": {
    background: vars.color.bg.inputFocus,
    borderColor: vars.color.border.focus,
    boxShadow: `0 0 0 3px ${vars.color.primary.ring}`,
  },
  ":disabled": {
    opacity: 0.5,
  },
  // Hide spin buttons
  "::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
});

// Toggle switch for HTTP/2
export const toggleRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
  padding: `${vars.space.sm} 0`,
});

export const toggleLabel = style({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});

export const toggleLabelText = style({
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.secondary,
  textTransform: "uppercase",
  letterSpacing: vars.font.letterSpacing.caps,
});

export const toggleLabelHint = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
});

export const switchRoot = style({
  width: "42px",
  height: "24px",
  backgroundColor: vars.color.bg.input,
  borderRadius: "9999px",
  position: "relative",
  border: `1px solid ${vars.color.border.default}`,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  flexShrink: 0,
  selectors: {
    '&[data-state="checked"]': {
      backgroundColor: vars.color.primary.base,
      borderColor: vars.color.primary.base,
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: `0 0 0 3px ${vars.color.primary.ring}`,
    },
  },
});

export const switchThumb = style({
  display: "block",
  width: "18px",
  height: "18px",
  backgroundColor: vars.color.text.primary,
  borderRadius: "9999px",
  transition: `transform ${vars.transition.fast}`,
  transform: "translateX(2px)",
  willChange: "transform",
  selectors: {
    '&[data-state="checked"]': {
      transform: "translateX(20px)",
      backgroundColor: vars.color.switchThumb,
    },
  },
});

// Headers
export const headersToggle = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  width: "100%",
  padding: 0,
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
});

export const toggleIcon = style({
  fontSize: "8px",
  color: vars.color.text.muted,
  width: "10px",
});

export const headerCount = style({
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.primary.base,
  background: vars.color.primary.subtle,
  padding: "2px 6px",
  borderRadius: "8px",
});

export const headersContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
});

export const headersList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
});

export const headerRow = style({
  display: "flex",
  gap: vars.space.xs,
  alignItems: "center",
});

export const headerInput = style({
  height: "30px",
  padding: `0 ${vars.space.sm}`,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.md,
  color: vars.color.text.primary,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  outline: "none",
  transition: `all ${vars.transition.fast}`,
  ":focus": {
    background: vars.color.bg.inputFocus,
    borderColor: vars.color.border.focus,
  },
  ":disabled": {
    opacity: 0.5,
  },
});

export const headerKey = style([
  headerInput,
  {
    width: "40%",
  },
]);

export const headerValue = style([
  headerInput,
  {
    flex: 1,
  },
]);

export const headerRemoveBtn = style({
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: vars.radius.sm,
  color: vars.color.text.muted,
  fontSize: vars.font.size.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  flexShrink: 0,
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  selectors: {
    "&:hover:not(:disabled)": {
      background: vars.color.danger.subtle,
      color: vars.color.danger.base,
    },
  },
});

export const addHeaderBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.sm,
  padding: vars.space.sm,
  background: "transparent",
  border: `1px dashed ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  color: vars.color.text.muted,
  fontSize: vars.font.size.md,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  selectors: {
    "&:hover:not(:disabled)": {
      background: vars.color.primary.subtle,
      borderColor: vars.color.primary.base,
      color: vars.color.primary.base,
    },
  },
});

// Advanced options section
export const advancedSection = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
  padding: `${vars.space.sm} 0`,
});

export const advancedToggle = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  width: "100%",
  padding: 0,
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
});

export const advancedContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
  marginTop: vars.space.sm,
});

export const advancedRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
  padding: `${vars.space.xs} 0`,
});

export const advancedToggleRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
  padding: `${vars.space.xs} 0`,
});

export const advancedRowLabel = style({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
});

export const advancedRowName = style({
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.medium,
  color: vars.color.text.primary,
});

export const advancedRowDesc = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
});

export const advancedInput = style({
  width: "80px",
  height: "32px",
  padding: `0 ${vars.space.sm}`,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  outline: "none",
  textAlign: "right",
  transition: `all ${vars.transition.fast}`,
  ":focus": {
    background: vars.color.bg.inputFocus,
    borderColor: vars.color.border.focus,
    boxShadow: `0 0 0 3px ${vars.color.primary.ring}`,
  },
  ":disabled": {
    opacity: 0.5,
  },
  "::placeholder": {
    color: vars.color.text.muted,
  },
  // Hide spin buttons
  "::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
});

export const advancedInputWide = style({
  width: "120px",
  height: "32px",
  padding: `0 ${vars.space.sm}`,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.sm,
  color: vars.color.text.primary,
  background: vars.color.bg.input,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  outline: "none",
  textAlign: "left",
  transition: `all ${vars.transition.fast}`,
  ":focus": {
    background: vars.color.bg.inputFocus,
    borderColor: vars.color.border.focus,
    boxShadow: `0 0 0 3px ${vars.color.primary.ring}`,
  },
  ":disabled": {
    opacity: 0.5,
  },
  "::placeholder": {
    color: vars.color.text.muted,
  },
});
