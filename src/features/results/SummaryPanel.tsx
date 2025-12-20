/**
 * SummaryPanel - Test results summary cards
 * Container component connecting to testRunnerStore.
 */

import { useRef } from "react";
import { useTestRunnerStore } from "../../store";
import { StatCard } from "../../components/feedback";
import { Panel } from "../../components/layout";
import { formatMs } from "../../utils/format";
import * as styles from "./results.css";

// Threshold for "slow" response time (1 second)
const SLOW_RESPONSE_THRESHOLD_MS = 1000;

/**
 * Displays summary statistics cards.
 */
export function SummaryPanel() {
  const stats = useTestRunnerStore((s) => s.stats);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!stats) return null;

  // Determine if slowest response is concerning
  const isSlowestSlow = stats.max_response_time_ms >= SLOW_RESPONSE_THRESHOLD_MS;
  const isAvgSlow = stats.avg_response_time_ms >= SLOW_RESPONSE_THRESHOLD_MS;

  return (
    <Panel ref={panelRef} title="Summary" copyTitle="Summary">
      <div className={styles.summaryCards}>
        <StatCard label="Total Time" value={`${stats.total_time_secs.toFixed(2)}s`} />
        <StatCard
          label="Requests/sec"
          value={stats.requests_per_second.toFixed(2)}
          variant="accent"
        />
        <StatCard
          label="Avg Response"
          value={formatMs(stats.avg_response_time_ms)}
          variant={isAvgSlow ? "warning" : "default"}
        />
        <StatCard label="Fastest" value={formatMs(stats.min_response_time_ms)} />
        <StatCard
          label="Slowest"
          value={formatMs(stats.max_response_time_ms)}
          variant={isSlowestSlow ? "warning" : "default"}
        />
      </div>
    </Panel>
  );
}
