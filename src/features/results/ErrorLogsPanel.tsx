/**
 * ErrorLogsPanel - Failed request error logs (compact view)
 * Container component connecting to stores.
 */

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTestRunnerStore, useUIStore } from "../../store";
import { formatMs } from "../../utils/format";
import type { ErrorType } from "../../types/api";
import * as styles from "./results.css";

/** Get display label for error type */
function getErrorTypeLabel(errorType: ErrorType): string {
  switch (errorType) {
    case "Timeout":
      return "Timeout";
    case "Connection":
      return "Connect";
    case "Request":
      return "Request";
    case "Response":
      return "HTTP";
    case "Redirect":
      return "Redirect";
    case "Other":
      return "Error";
    default:
      return "Error";
  }
}

/** Get style class for error type */
function getErrorTypeStyle(errorType: ErrorType): string {
  switch (errorType) {
    case "Timeout":
      return styles.errorLogStatusTimeout;
    case "Connection":
      return styles.errorLogStatusNetwork;
    case "Response":
      return styles.errorLogStatusHttp;
    default:
      return styles.errorLogStatusNetwork;
  }
}

/**
 * Displays collapsible list of error logs from failed requests.
 * Uses a compact table-like layout for better readability.
 */
export function ErrorLogsPanel() {
  const stats = useTestRunnerStore((s) => s.stats);
  const layoutSettings = useUIStore((s) => s.layoutSettings);
  const { showErrorLogs, setShowErrorLogs } = useUIStore();

  if (!stats || !layoutSettings.showErrorLogs || stats.error_logs.length === 0) {
    return null;
  }

  return (
    <Collapsible.Root
      open={showErrorLogs}
      onOpenChange={setShowErrorLogs}
      className={styles.errorLogsSection}
    >
      <Collapsible.Trigger className={styles.errorLogsHeader}>
        <span className={styles.errorLogsCollapseIcon}>
          {showErrorLogs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        <span className={styles.errorLogsTitleText}>Error Logs</span>
        <span className={styles.errorCountBadge}>{stats.error_logs.length}</span>
      </Collapsible.Trigger>

      <Collapsible.Content className={styles.errorLogsContent}>
        <div className={styles.errorLogsList}>
          {stats.error_logs.map((log, index) => (
            <div key={index} className={styles.errorLogEntry}>
              <span className={styles.errorLogTime}>@{(log.timestamp_ms / 1000).toFixed(2)}s</span>
              <span className={`${styles.errorLogStatus} ${getErrorTypeStyle(log.error_type)}`}>
                {getErrorTypeLabel(log.error_type)}
              </span>
              {log.status > 0 && (
                <span className={`${styles.errorLogStatus} ${styles.errorLogStatusHttp}`}>
                  {log.status}
                </span>
              )}
              <span className={styles.errorLogMessage} title={log.error}>
                {log.error}
              </span>
              <span className={styles.errorLogDuration}>{formatMs(log.duration_ms)}</span>
            </div>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
