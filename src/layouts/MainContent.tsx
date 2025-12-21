/**
 * MainContent - Right main content area
 */

import { useTestRunnerStore, useUIStore } from "../store";
import { ProgressView } from "../features/test-runner";
import { ResultsContainer } from "../features/results";
import * as styles from "./MainContent.css";

/**
 * Main content area showing progress or results.
 */
export function MainContent() {
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const stats = useTestRunnerStore((s) => s.stats);
  const theme = useUIStore((s) => s.theme);

  const logoSrc = theme === "light" ? "/logo-light.svg" : "/logo-dark.svg";

  return (
    <main className={styles.mainContent}>
      {/* Show progress while running */}
      {isRunning && <ProgressView />}

      {/* Show results when complete */}
      {!isRunning && stats && <ResultsContainer />}

      {/* Empty state when no results */}
      {!isRunning && !stats && (
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
}
