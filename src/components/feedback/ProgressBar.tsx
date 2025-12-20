/**
 * ProgressBar - Progress indicator component
 * Pure presentational component with no store access.
 */

import type { ProgressBarProps } from "../../types/components";
import * as styles from "./feedback.css";

/**
 * A horizontal progress bar.
 */
export function ProgressBar({ value, max, className = "" }: ProgressBarProps) {
  const percent = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className={`${styles.progressBarLarge} ${className}`}>
      <div className={styles.progressBarFill} style={{ width: `${percent}%` }} />
    </div>
  );
}
