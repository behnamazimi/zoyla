/**
 * HistoryPanel - Test history list and management
 * Container component connecting to stores.
 */

import * as Popover from "@radix-ui/react-popover";
import { History, X } from "lucide-react";
import { useHistoryStore, useTestConfigStore, useTestRunnerStore, useUIStore } from "../../store";
import { HistoryEntry } from "./HistoryEntry";
import * as styles from "./history.css";
import * as toolbarStyles from "../../layouts/Toolbar.css";

/**
 * Displays list of previous test runs with management options.
 */
export function HistoryPanel() {
  const { entries, selectedId, deleteEntry, clearAll, selectEntry } = useHistoryStore();
  const { setFromHistoryEntry } = useTestConfigStore();
  const { setStats, setTestStartTime } = useTestRunnerStore();
  const { showHistory, setShowHistory } = useUIStore();

  const handleSelect = (entry: (typeof entries)[0]) => {
    setFromHistoryEntry(entry);
    setStats(entry.stats);
    setTestStartTime(new Date(entry.timestamp));
    selectEntry(entry.id);
    setShowHistory(false);
  };

  return (
    <Popover.Root open={showHistory} onOpenChange={setShowHistory}>
      <Popover.Trigger asChild>
        <button
          className={`${toolbarStyles.toolbarButton} ${showHistory ? toolbarStyles.toolbarButtonActive : ""}`}
          aria-label="Test History"
        >
          <History size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.historyPopoverContent} sideOffset={8} align="end">
          <div className={styles.historyPanelHeader}>
            <h3>Test History</h3>
            <div className={styles.historyPanelActions}>
              {entries.length > 0 && (
                <button
                  className={styles.historyClearBtn}
                  onClick={clearAll}
                  title="Clear all history"
                >
                  Clear All
                </button>
              )}
              <Popover.Close asChild>
                <button className={styles.historyCloseBtn} aria-label="Close history">
                  <X size={14} />
                </button>
              </Popover.Close>
            </div>
          </div>

          <div className={styles.historyList}>
            {entries.length === 0 ? (
              <div className={styles.historyEmpty}>
                <p>No test history yet</p>
                <p className={styles.historyEmptyHint}>Run a test to see it appear here</p>
              </div>
            ) : (
              entries.map((entry) => (
                <HistoryEntry
                  key={entry.id}
                  entry={entry}
                  isSelected={entry.id === selectedId}
                  onSelect={() => handleSelect(entry)}
                  onDelete={() => deleteEntry(entry.id)}
                />
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
