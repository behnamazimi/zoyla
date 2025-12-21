/**
 * App - Root application component
 * Composes layout components and initializes app-level concerns.
 */

import { usePersistence, useKeyboardShortcuts } from "./hooks";
import { AppShell, Toolbar, Sidebar, MainContent, StatusBar } from "./layouts";
import { ToastProvider } from "./components/feedback";
import * as layoutStyles from "./layouts/AppShell.css";
import { useEffect } from "react";

// Initialize global styles (theme + reset)
import "./styles";

async function showAppWindow() {
  const appWindow = (await import("@tauri-apps/api/window")).getCurrentWindow();
  appWindow.show();
}

/**
 * Root component that composes the application structure.
 * Handles persistence initialization and renders main layout.
 */
export default function App() {
  // Initialize persistence (load history and settings)
  usePersistence();

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    // Reveal the initially hidden app window
    showAppWindow();
  }, []);

  return (
    <ToastProvider>
      <AppShell>
        {/* Top Toolbar (includes History & Settings popovers) */}
        <Toolbar />

        {/* Main Layout */}
        <div className={layoutStyles.mainLayout}>
          <Sidebar />
          <MainContent />
        </div>

        {/* Bottom Status Bar */}
        <StatusBar />
      </AppShell>
    </ToastProvider>
  );
}
