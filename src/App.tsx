/**
 * App - Root application component
 * Composes layout components and initializes app-level concerns.
 */

import { usePersistence, useKeyboardShortcuts } from "./hooks";
import { AppShell, Toolbar, Sidebar, MainContent } from "./layouts";
import * as layoutStyles from "./layouts/AppShell.css";

// Initialize global styles (theme + reset)
import "./styles";

/**
 * Root component that composes the application structure.
 * Handles persistence initialization and renders main layout.
 */
export default function App() {
  // Initialize persistence (load history and settings)
  usePersistence();

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <AppShell>
      {/* Top Toolbar (includes History & Settings popovers) */}
      <Toolbar />

      {/* Main Layout */}
      <div className={layoutStyles.mainLayout}>
        <Sidebar />
        <MainContent />
      </div>
    </AppShell>
  );
}
