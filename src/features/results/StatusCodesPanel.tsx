/**
 * StatusCodesPanel - HTTP status code distribution
 * Container component connecting to testRunnerStore.
 */

import { useRef } from "react";
import { useTestRunnerStore } from "../../store";
import { StatusBadge } from "../../components/feedback";
import { Panel } from "../../components/layout";
import * as styles from "./results.css";

/**
 * Displays the distribution of HTTP status codes.
 */
export function StatusCodesPanel() {
  const stats = useTestRunnerStore((s) => s.stats);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!stats) return null;

  return (
    <Panel ref={panelRef} title="Status Codes" copyTitle="Status Codes">
      <div className={styles.statusCodesList}>
        {stats.status_codes.map((sc, index) => (
          <StatusBadge key={index} code={sc.code} count={sc.count} />
        ))}
      </div>
    </Panel>
  );
}
