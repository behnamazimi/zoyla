/**
 * ProgressView - Live test progress display
 * Container component connecting to testRunnerStore.
 */

import { useTestRunnerStore } from "../../store";
import { ProgressBar } from "../../components/feedback";
import { formatMs } from "../../utils/format";
import * as styles from "./test-runner.css";

/**
 * Displays real-time progress during test execution.
 */
export function ProgressView() {
  const { isRunning, progress } = useTestRunnerStore();

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
        <div className={styles.liveTile}>
          <span className={styles.liveTileLabel}>Completed</span>
          <span className={styles.liveTileValue}>
            {progress.completed}/{progress.total}
          </span>
        </div>
        <div className={`${styles.liveTile} ${styles.liveTileVariants.accent}`}>
          <span className={styles.liveTileLabel}>Requests/sec</span>
          <span className={`${styles.liveTileValue} ${styles.liveTileValueVariants.highlight}`}>
            {progress.current_rps.toFixed(1)}
          </span>
        </div>
        <div className={styles.liveTile}>
          <span className={styles.liveTileLabel}>Elapsed Time</span>
          <span className={styles.liveTileValue}>{progress.elapsed_secs.toFixed(2)}s</span>
        </div>
        <div className={`${styles.liveTile} ${styles.liveTileVariants.success}`}>
          <span className={styles.liveTileLabel}>Successful</span>
          <span className={`${styles.liveTileValue} ${styles.liveTileValueVariants.success}`}>
            {progress.successful}
          </span>
        </div>
        <div className={`${styles.liveTile} ${styles.liveTileVariants.error}`}>
          <span className={styles.liveTileLabel}>Failed</span>
          <span className={`${styles.liveTileValue} ${styles.liveTileValueVariants.error}`}>
            {progress.failed}
          </span>
        </div>
        <div className={styles.liveTile}>
          <span className={styles.liveTileLabel}>Latest Response</span>
          <span className={styles.liveTileValue}>{formatMs(progress.latest_response_time_ms)}</span>
        </div>
      </div>
    </div>
  );
}
