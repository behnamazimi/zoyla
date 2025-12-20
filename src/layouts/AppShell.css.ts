/**
 * AppShell Styles
 */

import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const app = style({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  // Theme-responsive gradient background
  background: "var(--app-bg-gradient)",
});

export const mainLayout = style({
  flex: 1,
  display: "flex",
  overflow: "hidden",
  padding: vars.space.md,
  paddingTop: 0,
  gap: vars.space.md,
});
