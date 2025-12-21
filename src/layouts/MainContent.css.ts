/**
 * MainContent Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const mainContent = style({
  flex: 1,
  overflowY: "auto",
  background: vars.color.bg.content,
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: `1px solid ${vars.color.border.subtle}`,
  borderRadius: vars.radius.lg,
  marginTop: vars.space.md,
  boxShadow: vars.shadow.lg,
});

export const emptyState = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space.xxl,
  textAlign: "center",
});

export const emptyStateIcon = style({
  width: "64px",
  height: "64px",
  marginBottom: vars.space.lg,
  opacity: 0.6,
  color: vars.color.text.secondary,
});

export const emptyStateLogo = style({
  width: "120px",
  height: "auto",
  marginBottom: vars.space.lg,
});

export const emptyStateTitle = style({
  fontSize: vars.font.size.xxxl,
  fontWeight: vars.font.weight.semibold,
  color: vars.color.text.primary,
  marginBottom: vars.space.sm,
});

export const emptyStateDescription = style({
  fontSize: vars.font.size.lg,
  color: vars.color.text.secondary,
  maxWidth: "360px",
  lineHeight: 1.6,
  marginBottom: vars.space.xl,
});
