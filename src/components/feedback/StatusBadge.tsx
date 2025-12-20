/**
 * StatusBadge - HTTP status code badge
 * Pure presentational component with no store access.
 */

import { Check, ArrowRight, AlertTriangle, XCircle, Wifi } from "lucide-react";
import type { StatusBadgeProps } from "../../types/components";
import * as styles from "./feedback.css";

/**
 * Gets the appropriate style variant for an HTTP status code.
 */
function getStatusVariant(code: number): keyof typeof styles.statusCodeBadgeVariants {
  if (code === 0) return "unknown";
  if (code >= 200 && code < 300) return "success";
  if (code >= 300 && code < 400) return "redirect";
  if (code >= 400 && code < 500) return "clientError";
  if (code >= 500) return "serverError";
  return "unknown";
}

/**
 * Gets the appropriate icon for an HTTP status code.
 */
function getStatusIcon(code: number) {
  if (code === 0) return <Wifi size={12} />;
  if (code >= 200 && code < 300) return <Check size={12} strokeWidth={3} />;
  if (code >= 300 && code < 400) return <ArrowRight size={12} />;
  if (code >= 400 && code < 500) return <AlertTriangle size={12} />;
  if (code >= 500) return <XCircle size={12} />;
  return <XCircle size={12} />;
}

/**
 * A badge displaying an HTTP status code with color coding and icon.
 */
export function StatusBadge({ code, count }: StatusBadgeProps) {
  const variant = getStatusVariant(code);
  const displayCode = code === 0 ? "ERR" : code;
  const icon = getStatusIcon(code);

  return (
    <div className={`${styles.statusCodeItem} ${styles.statusCodeItemVariants[variant]}`}>
      <span className={`${styles.statusCodeBadge} ${styles.statusCodeBadgeVariants[variant]}`}>
        <span className={styles.statusCodeIcon}>{icon}</span>
        {displayCode}
      </span>
      {count !== undefined && <span className={styles.statusCodeCount}>{count} responses</span>}
    </div>
  );
}
