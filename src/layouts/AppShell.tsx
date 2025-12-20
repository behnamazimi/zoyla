/**
 * AppShell - Main application layout structure
 */

import type { ReactNode } from "react";
import * as styles from "./AppShell.css";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Root layout component that wraps the entire application.
 */
export function AppShell({ children }: AppShellProps) {
  return <div className={styles.app}>{children}</div>;
}
