/**
 * MainContent - Right main content area
 */

import { Zap } from "lucide-react";
import { useTestRunnerStore } from "../store";
import { ProgressView } from "../features/test-runner";
import { ResultsContainer } from "../features/results";
import * as styles from "./MainContent.css";

/**
 * Main content area showing progress or results.
 */
export function MainContent() {
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const stats = useTestRunnerStore((s) => s.stats);

  return (
    <main className={styles.mainContent}>
      {/* Show progress while running */}
      {isRunning && <ProgressView />}

      {/* Show results when complete */}
      {!isRunning && stats && <ResultsContainer />}

      {/* Empty state when no results */}
      {!isRunning && !stats && (
        <div className={styles.emptyState}>
          <Zap size={48} className={styles.emptyStateIcon} strokeWidth={1.5} />
          <h2 className={styles.emptyStateTitle}>Ready to Load Test</h2>
          <p className={styles.emptyStateDescription}>
            Configure your test parameters in the sidebar and click Run Test to begin.
          </p>
        </div>
      )}
    </main>
  );
}
