/**
 * Global Styles - Reset and base styles
 */

import { globalStyle, keyframes } from "@vanilla-extract/css";
import { vars } from "./theme.css";

// Reset
globalStyle("*", {
  boxSizing: "border-box",
  margin: 0,
  padding: 0,
});

// Body - disable all text selection for native app feel
globalStyle("html, body", {
  fontFamily: vars.font.family.system,
  fontSize: vars.font.size.base,
  lineHeight: vars.font.lineHeight.normal,
  letterSpacing: vars.font.letterSpacing.normal,
  color: vars.color.text.primary,
  background: "#0f0f14", // Dark theme background to prevent white flash
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  userSelect: "none",
  WebkitUserSelect: "none",
  cursor: "default",
});

// Light theme body background
globalStyle(':root[data-theme="light"] html, :root[data-theme="light"] body', {
  background: "#f5f5fa", // Light theme background
});

// Ensure no selection on any element
globalStyle("*", {
  userSelect: "none",
  WebkitUserSelect: "none",
});

// Allow selection only in input fields
globalStyle("input, textarea", {
  userSelect: "text",
  WebkitUserSelect: "text",
  cursor: "text",
});

// Scrollbar styles
globalStyle("::-webkit-scrollbar", {
  width: "8px",
});

globalStyle("::-webkit-scrollbar-track", {
  background: "transparent",
});

globalStyle("::-webkit-scrollbar-thumb", {
  background: vars.color.border.subtle,
  borderRadius: "4px",
});

globalStyle("::-webkit-scrollbar-thumb:hover", {
  background: vars.color.border.default,
});

// Animation keyframes
export const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

export const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

export const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const slideDown = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(-8px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const errorGlow = keyframes({
  "0%, 100%": {
    boxShadow: "var(--error-glow-sm)",
  },
  "50%": {
    boxShadow: "var(--error-glow-lg)",
  },
});
