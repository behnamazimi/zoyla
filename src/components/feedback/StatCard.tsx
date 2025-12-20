/**
 * StatCard - Statistic display card
 * Pure presentational component with no store access.
 */

import type { StatCardProps } from "../../types/components";
import * as styles from "./feedback.css";

/**
 * A card displaying a single statistic with label.
 */
export function StatCard({ label, value, variant = "default", className = "" }: StatCardProps) {
  const cardVariantClass =
    variant === "accent"
      ? styles.summaryCardAccent
      : variant === "warning"
        ? styles.summaryCardWarning
        : "";

  const valueVariantClass = variant === "warning" ? styles.summaryCardValueWarning : "";

  return (
    <div className={`${styles.summaryCard} ${cardVariantClass} ${className}`}>
      <span className={`${styles.summaryCardValue} ${valueVariantClass}`}>{value}</span>
      <span className={styles.summaryCardLabel}>{label}</span>
    </div>
  );
}
