/**
 * HistoryEntry - Single history item display
 * Presentational component receiving data via props.
 */

import { X } from "lucide-react";
import type { HistoryEntry as HistoryEntryType } from "../../types/api";
import { truncate } from "../../utils/format";
import * as styles from "./history.css";

interface HistoryEntryProps {
  entry: HistoryEntryType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

/**
 * Displays a single test history entry.
 */
export function HistoryEntry({ entry, isSelected, onSelect, onDelete }: HistoryEntryProps) {
  const successRate = entry.successfulRequests / (entry.successfulRequests + entry.failedRequests);
  const statusVariant = successRate >= 0.95 ? "success" : successRate >= 0.8 ? "warning" : "error";
  const methodVariant = entry.method.toLowerCase() as keyof typeof styles.historyMethodVariants;

  return (
    <div
      className={`${styles.historyEntry} ${isSelected ? styles.historyEntrySelected : ""}`}
      onClick={onSelect}
    >
      <div className={styles.historyEntryHeader}>
        <span
          className={`${styles.historyMethod} ${styles.historyMethodVariants[methodVariant] || ""}`}
        >
          {entry.method}
        </span>
        <span className={styles.historyUrl} title={entry.url}>
          {truncate(entry.url, 40)}
        </span>
        <button
          className={styles.historyDeleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete entry"
        >
          <X size={12} />
        </button>
      </div>

      <div className={styles.historyEntryStats}>
        <span className={styles.historyStat}>
          <span className={styles.historyStatLabel}>Requests</span>
          <span className={styles.historyStatValue}>{entry.numRequests}</span>
        </span>
        <span className={styles.historyStat}>
          <span className={styles.historyStatLabel}>RPS</span>
          <span className={styles.historyStatValue}>{entry.requestsPerSecond.toFixed(1)}</span>
        </span>
        <span className={styles.historyStat}>
          <span className={styles.historyStatLabel}>Avg</span>
          <span className={styles.historyStatValue}>{entry.avgResponseMs.toFixed(0)}ms</span>
        </span>
        <span className={`${styles.historyStat} ${styles.historyStatVariants[statusVariant]}`}>
          <span className={styles.historyStatLabel}>Success</span>
          <span className={styles.historyStatValue}>{(successRate * 100).toFixed(0)}%</span>
        </span>
      </div>

      <div className={styles.historyEntryFooter}>
        <span className={styles.historyTimestamp}>
          {new Date(entry.timestamp).toLocaleString()}
        </span>
        <span
          className={`${styles.historyProtocol} ${entry.useHttp2 ? styles.historyProtocolHttp2 : ""}`}
        >
          {entry.useHttp2 ? "HTTP/2" : "HTTP/1.1"}
        </span>
      </div>
    </div>
  );
}
