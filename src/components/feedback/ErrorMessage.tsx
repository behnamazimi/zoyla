/**
 * ErrorMessage - Error display component
 * Pure presentational component with no store access.
 */

import { X } from "lucide-react";
import type { ErrorMessageProps } from "../../types/components";
import * as styles from "./feedback.css";

/**
 * Displays an error message with optional dismiss button.
 */
export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className={styles.errorBox}>
      <span className={`${styles.statusDot} ${styles.statusDotVariants.error}`} />
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          className={styles.errorDismiss}
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
