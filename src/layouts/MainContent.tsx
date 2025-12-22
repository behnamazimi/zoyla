/**
 * MainContent - Right main content area
 * Uses fine-grained selectors to minimize re-renders during test execution.
 */

import { memo } from "react";
import { useTestRunnerStore, useUIStore } from "../store";
import { ProgressView } from "../features/test-runner";
import { ResultsContainer } from "../features/results";
import * as styles from "./MainContent.css";

/**
 * Main content area showing progress or results.
 * Memoized to prevent unnecessary re-renders.
 */
export const MainContent = memo(function MainContent() {
  // Use fine-grained selectors - only subscribe to what we need
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  // Only check if stats exists, not the full object (avoids re-render on stats change)
  const hasStats = useTestRunnerStore((s) => s.stats !== null);
  const theme = useUIStore((s) => s.theme);

  const logoSrc = theme === "light" ? "/logo-light.svg" : "/logo-dark.svg";

  return (
    <main className={styles.mainContent}>
      {/* Show progress while running */}
      {isRunning && <ProgressView />}

      {/* Show results when complete */}
      {!isRunning && hasStats && <ResultsContainer />}

      {/* Empty state when no results */}
      {!isRunning && !hasStats && (
        <div className={styles.emptyState}>
          <img src={logoSrc} alt="Zoyla" className={styles.emptyStateLogo} />
          <h2 className={styles.emptyStateTitle}>Zoyla, Ready to Test</h2>
          <p className={styles.emptyStateDescription}>
            Set your target, tweak the parameters, and let Zoyla hammer your endpoints.
          </p>
        </div>
      )}
    </main>
  );
});
