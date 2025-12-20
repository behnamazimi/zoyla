/**
 * JSON Export Service - Export test results as JSON
 */

import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { LoadTestStats } from "../../types/api";

interface ExportConfig {
  url: string;
  method: string;
  numRequests: number;
  useHttp2: boolean;
}

/**
 * Exports test results as a JSON file.
 * Opens a save dialog and writes the formatted JSON.
 * @param stats - Test statistics to export
 * @param config - Test configuration for context
 * @returns Promise resolving to true if exported, false if cancelled
 */
export async function exportAsJson(stats: LoadTestStats, config: ExportConfig): Promise<boolean> {
  const filePath = await save({
    filters: [{ name: "JSON", extensions: ["json"] }],
    defaultPath: `zoyla-results-${new Date().toISOString().slice(0, 10)}.json`,
  });

  if (!filePath) {
    return false;
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    config: {
      url: config.url,
      method: config.method,
      numRequests: config.numRequests,
      useHttp2: config.useHttp2,
    },
    summary: {
      totalRequests: stats.total_requests,
      successfulRequests: stats.successful_requests,
      failedRequests: stats.failed_requests,
      totalTimeSecs: stats.total_time_secs,
      avgResponseTimeMs: stats.avg_response_time_ms,
      minResponseTimeMs: stats.min_response_time_ms,
      maxResponseTimeMs: stats.max_response_time_ms,
      requestsPerSecond: stats.requests_per_second,
    },
    percentiles: stats.percentiles,
    statusCodes: stats.status_codes,
    histogram: stats.histogram,
    throughputOverTime: stats.throughput_over_time,
    latencyOverTime: stats.latency_over_time,
    errorLogs: stats.error_logs,
    results: stats.results,
  };

  await writeTextFile(filePath, JSON.stringify(exportData, null, 2));
  return true;
}
