/**
 * Sidebar - Left configuration sidebar
 */

import { FormEvent, useCallback, useEffect } from "react";
import { useResizable, useTestRunner } from "../hooks";
import { useTestRunnerStore } from "../store";
import { TestConfigPanel } from "../features/test-config";
import { RunButton } from "../features/test-runner";
import { ResizeHandle } from "../components/layout";
import { useToast } from "../components/feedback";
import * as styles from "./Sidebar.css";

/**
 * Left sidebar containing test configuration and controls.
 */
export function Sidebar() {
  const { sidebarRef, sidebarWidth, startResizing } = useResizable();
  const { runTest, cancelTest } = useTestRunner();
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const error = useTestRunnerStore((s) => s.error);
  const setError = useTestRunnerStore((s) => s.setError);
  const { showError } = useToast();

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      showError(error);
      // Clear the error from store after showing toast
      setError(null);
    }
  }, [error, showError, setError]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!isRunning) {
        runTest();
      }
    },
    [isRunning, runTest]
  );

  return (
    <aside className={styles.sidebar} ref={sidebarRef} style={{ width: sidebarWidth }}>
      <form onSubmit={handleSubmit} className={styles.sidebarForm}>
        {/* Scrollable config area */}
        <div className={styles.sidebarContent}>
          <TestConfigPanel />
        </div>

        {/* Sticky footer with Run button */}
        <div className={styles.sidebarFooter}>
          <RunButton onRun={runTest} onCancel={cancelTest} />
        </div>
      </form>

      {/* Resize Handle */}
      <ResizeHandle onResizeStart={startResizing} />
    </aside>
  );
}
