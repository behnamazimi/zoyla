/**
 * ResultsContainer - Orchestrates all result panels
 * Container component connecting to stores.
 */

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download, FileJson, FileSpreadsheet, X } from "lucide-react";
import { useTestRunnerStore, useTestConfigStore, useHistoryStore } from "../../store";
import { exportAsJson, exportAsCsv } from "../../services/export";
import { Tooltip } from "../../components/buttons";
import { SummaryPanel } from "./SummaryPanel";
import { StatusCodesPanel } from "./StatusCodesPanel";
import { ChartsGrid } from "./ChartsGrid";
import { ErrorLogsPanel } from "./ErrorLogsPanel";
import * as styles from "./results.css";

/**
 * Formats a Date to a smart relative/absolute string.
 */
function formatTestTime(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  // Format time part
  const timeStr = date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  // Less than 1 minute
  if (diffMins < 1) {
    return "Just now";
  }

  // Less than 1 hour
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }

  // Less than 2 hours
  if (diffHours < 2) {
    return `${diffHours} hour ago`;
  }

  // Check if same day
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Today at ${timeStr}`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeStr}`;
  }

  // Older dates
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Main container for all test result visualizations.
 */
export function ResultsContainer() {
  const stats = useTestRunnerStore((s) => s.stats);
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const testStartTime = useTestRunnerStore((s) => s.testStartTime);
  const clearResults = useTestRunnerStore((s) => s.clearResults);
  const selectEntry = useHistoryStore((s) => s.selectEntry);
  const { url, method, numRequests, useHttp2 } = useTestConfigStore();

  if (!stats || isRunning) {
    return null;
  }

  const handleExportJson = () => {
    exportAsJson(stats, { url, method, numRequests, useHttp2 });
  };

  const handleExportCsv = () => {
    exportAsCsv(stats, { url, method, numRequests });
  };

  const handleClearResults = () => {
    clearResults();
    selectEntry(null);
  };

  const successRate = stats.successful_requests / (stats.successful_requests + stats.failed_requests);
  const statusVariant = successRate >= 0.95 ? "success" : successRate >= 0.8 ? "warning" : "error";

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <div className={styles.resultsTitleGroup}>
          <h2 className={styles.resultsTitle}>Load Test Results</h2>
          {testStartTime && (
            <span className={styles.resultsTimestamp}>{formatTestTime(testStartTime)}</span>
          )}
          <span className={`${styles.errorIndicator} ${styles.errorIndicatorVariants[statusVariant]}`}>
            {(successRate * 100).toFixed(0)}% success
          </span>
        </div>
        <div className={styles.resultsActions}>
          <Tooltip content="Export results">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className={styles.dropdownTrigger} aria-label="Export results">
                  <Download size={14} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.dropdownContent} sideOffset={4} align="end">
                  <DropdownMenu.Item className={styles.dropdownItem} onSelect={handleExportJson}>
                    <FileJson size={14} />
                    <span>Export JSON</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.dropdownItem} onSelect={handleExportCsv}>
                    <FileSpreadsheet size={14} />
                    <span>Export CSV</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </Tooltip>
          <Tooltip content="Clear results">
            <button
              className={styles.clearResultsBtn}
              onClick={handleClearResults}
              aria-label="Clear results"
            >
              <X size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      <SummaryPanel />
      <StatusCodesPanel />
      <ChartsGrid />
      <ErrorLogsPanel />
    </div>
  );
}
