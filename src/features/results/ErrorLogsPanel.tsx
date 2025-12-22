/**
 * ErrorLogsPanel - Failed request error logs (compact view)
 * Container component connecting to stores.
 * Uses virtualization for performance with large error lists.
 */

import { memo, useState, useRef, useCallback } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTestRunnerStore, useUIStore } from "../../store";
import { formatMs } from "../../utils/format";
import type { ErrorType, ErrorLogEntry } from "../../types/api";
import * as styles from "./results.css";

// Virtualization constants
const ITEM_HEIGHT = 28; // Height of each error log row in pixels
const VISIBLE_ITEMS = 15; // Number of items visible at once
const BUFFER_ITEMS = 5; // Extra items to render above/below viewport
const MAX_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // Max container height

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
 * Memoized error log row component.
 */
const ErrorLogRow = memo(function ErrorLogRow({
  log,
  style,
}: {
  log: ErrorLogEntry;
  style: React.CSSProperties;
}) {
  return (
    <div className={styles.errorLogEntry} style={style}>
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
  );
});

/**
 * Virtualized list component for error logs.
 * Only renders visible items plus a buffer for smooth scrolling.
 */
const VirtualizedErrorList = memo(function VirtualizedErrorList({
  logs,
}: {
  logs: ErrorLogEntry[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate visible range
  const totalHeight = logs.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_ITEMS);
  const endIndex = Math.min(
    logs.length,
    Math.ceil((scrollTop + MAX_HEIGHT) / ITEM_HEIGHT) + BUFFER_ITEMS
  );

  // Only render visible items
  const visibleItems = logs.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      className={styles.errorLogsList}
      style={{ maxHeight: MAX_HEIGHT, overflowY: "auto" }}
      onScroll={handleScroll}
    >
      {/* Spacer to maintain scroll position */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((log, index) => {
          const actualIndex = startIndex + index;
          return (
            <ErrorLogRow
              key={actualIndex}
              log={log}
              style={{
                position: "absolute",
                top: actualIndex * ITEM_HEIGHT,
                left: 0,
                right: 0,
                height: ITEM_HEIGHT,
              }}
            />
          );
        })}
      </div>
    </div>
  );
});

/**
 * Simple list for small error counts (no virtualization needed).
 */
const SimpleErrorList = memo(function SimpleErrorList({ logs }: { logs: ErrorLogEntry[] }) {
  return (
    <div className={styles.errorLogsList}>
      {logs.map((log, index) => (
        <ErrorLogRow key={index} log={log} style={{}} />
      ))}
    </div>
  );
});

/**
 * Displays collapsible list of error logs from failed requests.
 * Uses virtualization for large lists to maintain smooth scrolling.
 */
export const ErrorLogsPanel = memo(function ErrorLogsPanel() {
  const stats = useTestRunnerStore((s) => s.stats);
  const layoutSettings = useUIStore((s) => s.layoutSettings);
  const showErrorLogs = useUIStore((s) => s.showErrorLogs);
  const setShowErrorLogs = useUIStore((s) => s.setShowErrorLogs);

  if (!stats || !layoutSettings.showErrorLogs || stats.error_logs.length === 0) {
    return null;
  }

  // Use virtualization for large lists (> 50 items)
  const useVirtualization = stats.error_logs.length > 50;

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
        {useVirtualization ? (
          <VirtualizedErrorList logs={stats.error_logs} />
        ) : (
          <SimpleErrorList logs={stats.error_logs} />
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
});
