/**
 * History Feature Styles
 */

import { style, styleVariants, globalStyle } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

// Radix Popover Content
export const historyPopoverContent = style({
  width: "380px",
  maxHeight: "500px",
  background: vars.color.bg.overlay,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  zIndex: vars.zIndex.dropdown,
  display: "flex",
  flexDirection: "column",
  animationDuration: "150ms",
  animationTimingFunction: "ease",
});

export const historyPanelHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  flexShrink: 0,
});

globalStyle(`${historyPanelHeader} h3`, {
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
});

export const historyPanelActions = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
});

export const historyClearBtn = style({
  padding: `${vars.space.xs} ${vars.space.sm}`,
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.medium,
  color: vars.color.danger.base,
  background: vars.color.danger.subtle,
  border: `1px solid ${vars.color.danger.border}`,
  borderRadius: vars.radius.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.danger.border,
    borderColor: vars.color.danger.border,
  },
});

export const historyCloseBtn = style({
  width: "20px",
  height: "20px",
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
  ":hover": {
    background: vars.color.bg.surfaceHover,
    color: vars.color.text.primary,
  },
});

export const historyList = style({
  flex: 1,
  overflowY: "auto",
  padding: vars.space.sm,
});

export const historyEmpty = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: `${vars.space.xxl} ${vars.space.xl}`,
  textAlign: "center",
});

globalStyle(`${historyEmpty} p`, {
  fontSize: vars.font.size.base,
  color: vars.color.text.secondary,
  margin: 0,
});

export const historyEmptyHint = style({
  fontSize: `${vars.font.size.md} !important`,
  color: `${vars.color.text.muted} !important`,
  marginTop: `${vars.space.xs} !important`,
});

// History Entry
export const historyEntry = style({
  padding: `${vars.space.md} ${vars.space.md}`,
  background: vars.color.bg.input,
  border: "1px solid transparent",
  borderRadius: vars.radius.sm,
  marginBottom: vars.space.sm,
  cursor: "pointer",
  transition: `all ${vars.transition.fast}`,
  ":hover": {
    background: vars.color.bg.inputFocus,
    borderColor: vars.color.border.default,
  },
});

export const historyEntrySelected = style({
  background: vars.color.primary.subtle,
  borderColor: vars.color.primary.border,
});

export const historyEntryHeader = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  marginBottom: vars.space.sm,
});

export const historyMethod = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.bold,
  padding: "2px 6px",
  borderRadius: "3px",
  textTransform: "uppercase",
});

export const historyMethodVariants = styleVariants({
  get: {
    color: vars.color.success.base,
    background: vars.color.success.subtle,
  },
  post: {
    color: vars.color.primary.base,
    background: vars.color.primary.subtle,
  },
  put: {
    color: vars.color.warning.base,
    background: vars.color.warning.subtle,
  },
  delete: {
    color: vars.color.danger.base,
    background: vars.color.danger.subtle,
  },
  patch: {
    color: vars.color.info.base,
    background: vars.color.info.subtle,
  },
  head: {
    color: vars.color.text.secondary,
    background: vars.color.bg.surfaceHover,
  },
  options: {
    color: vars.color.text.secondary,
    background: vars.color.bg.surfaceHover,
  },
});

export const historyUrl = style({
  flex: 1,
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.md,
  color: vars.color.text.secondary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const historyDeleteBtn = style({
  width: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: vars.radius.sm,
  color: vars.color.text.muted,
  fontSize: vars.font.size.sm,
  cursor: "pointer",
  opacity: 0,
  transition: `all ${vars.transition.fast}`,
  selectors: {
    [`${historyEntry}:hover &`]: {
      opacity: 1,
    },
  },
  ":hover": {
    background: vars.color.danger.subtle,
    color: vars.color.danger.base,
  },
});

export const historyEntryStats = style({
  display: "flex",
  gap: vars.space.md,
  marginBottom: vars.space.sm,
});

export const historyStat = style({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});

export const historyStatLabel = style({
  fontSize: vars.font.size.xs,
  color: vars.color.text.muted,
});

export const historyStatValue = style({
  fontFamily: vars.font.family.mono,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
});

export const historyStatVariants = styleVariants({
  success: {},
  warning: {},
  error: {},
});

globalStyle(`${historyStatVariants.success} ${historyStatValue}`, {
  color: vars.color.success.base,
});

globalStyle(`${historyStatVariants.warning} ${historyStatValue}`, {
  color: vars.color.warning.base,
});

globalStyle(`${historyStatVariants.error} ${historyStatValue}`, {
  color: vars.color.danger.base,
});

export const historyEntryFooter = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const historyTimestamp = style({
  fontSize: vars.font.size.sm,
  color: vars.color.text.muted,
});

export const historyProtocol = style({
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.medium,
  padding: "2px 6px",
  borderRadius: "3px",
  background: vars.color.bg.surfaceHover,
  color: vars.color.text.muted,
});

export const historyProtocolHttp2 = style({
  background: vars.color.primary.subtle,
  color: vars.color.primary.base,
});
