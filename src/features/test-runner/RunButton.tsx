/**
 * RunButton - Test execution control button
 * Container component connecting to stores and hooks.
 */

import { Play, Square } from "lucide-react";
import { useTestRunnerStore } from "../../store";
import * as styles from "./test-runner.css";

interface RunButtonProps {
  onRun: () => void;
  onCancel: () => void;
}

/**
 * Button that toggles between Run and Stop states.
 * When not running, it's a submit button to allow form submission via Enter.
 */
export function RunButton({ onRun, onCancel }: RunButtonProps) {
  const isRunning = useTestRunnerStore((s) => s.isRunning);

  if (isRunning) {
    return (
      <button type="button" className={styles.stopButton} onClick={onCancel}>
        <Square size={14} fill="currentColor" />
        <span>Stop Test</span>
      </button>
    );
  }

  return (
    <button type="submit" className={styles.runButton} onClick={onRun}>
      <Play size={14} fill="currentColor" />
      <span>Run Test</span>
    </button>
  );
}
