/**
 * ProgressView - Live test progress display
 * Container component connecting to testRunnerStore.
 * Optimized for high-frequency updates during load tests.
 */

import { memo } from "react";
import { useTestRunnerStore } from "../../store";
import { ProgressBar } from "../../components/feedback";
import { formatMs } from "../../utils/format";
import * as styles from "./test-runner.css";

/**
 * Individual metric tile component - memoized to prevent unnecessary re-renders.
 */
const MetricTile = memo(function MetricTile({
  label,
  value,
  tileVariant,
  valueVariant,
}: {
  label: string;
  value: string | number;
  tileVariant?: string;
  valueVariant?: string;
}) {
  return (
    <div className={`${styles.liveTile} ${tileVariant || ""}`}>
      <span className={styles.liveTileLabel}>{label}</span>
      <span className={`${styles.liveTileValue} ${valueVariant || ""}`}>{value}</span>
    </div>
  );
});

/**
 * Displays real-time progress during test execution.
 * Uses fine-grained selectors to minimize re-renders.
 */
export const ProgressView = memo(function ProgressView() {
  // Use fine-grained selectors to only subscribe to what we need
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const progress = useTestRunnerStore((s) => s.progress);

  if (!isRunning || !progress) {
    return null;
  }

  const percent = (progress.completed / progress.total) * 100;

  return (
    <div className={styles.progressView}>
      <div className={styles.progressHeader}>
        <h2 className={styles.progressTitle}>Running Load Test</h2>
        <span className={styles.progressPercent}>{percent.toFixed(0)}%</span>
      </div>

      <ProgressBar value={progress.completed} max={progress.total} />

      <div className={styles.liveMetricsGrid}>
        <MetricTile label="Completed" value={`${progress.completed}/${progress.total}`} />
        <MetricTile
          label="Requests/sec"
          value={progress.current_rps.toFixed(1)}
          tileVariant={styles.liveTileVariants.accent}
          valueVariant={styles.liveTileValueVariants.highlight}
        />
        <MetricTile label="Elapsed Time" value={`${progress.elapsed_secs.toFixed(2)}s`} />
        <MetricTile
          label="Successful"
          value={progress.successful}
          tileVariant={styles.liveTileVariants.success}
          valueVariant={styles.liveTileValueVariants.success}
        />
        <MetricTile
          label="Failed"
          value={progress.failed}
          tileVariant={styles.liveTileVariants.error}
          valueVariant={styles.liveTileValueVariants.error}
        />
        <MetricTile label="Latest Response" value={formatMs(progress.latest_response_time_ms)} />
      </div>
    </div>
  );
});
