/**
 * CSV Export Service - Export test results as CSV
 */

import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { LoadTestStats } from "../../types/api";

interface ExportConfig {
  url: string;
  method: string;
  numRequests: number;
}

/**
 * Exports test results as a CSV file.
 * Opens a save dialog and writes the CSV with summary headers.
 * @param stats - Test statistics to export
 * @param config - Test configuration for context
 * @returns Promise resolving to true if exported, false if cancelled
 */
export async function exportAsCsv(stats: LoadTestStats, config: ExportConfig): Promise<boolean> {
  const filePath = await save({
    filters: [{ name: "CSV", extensions: ["csv"] }],
    defaultPath: `zoyla-results-${new Date().toISOString().slice(0, 10)}.csv`,
  });

  if (!filePath) {
    return false;
  }

  // Build CSV content with summary header
  const lines: string[] = [
    "# Zoyla Test Results",
    `# Exported: ${new Date().toISOString()}`,
    `# URL: ${config.url}`,
    `# Method: ${config.method}`,
    `# Total Requests: ${stats.total_requests}`,
    `# Successful: ${stats.successful_requests}`,
    `# Failed: ${stats.failed_requests}`,
    `# Total Time: ${stats.total_time_secs.toFixed(4)}s`,
    `# Requests/sec: ${stats.requests_per_second.toFixed(2)}`,
    `# Avg Response: ${stats.avg_response_time_ms.toFixed(2)}ms`,
    `# Min Response: ${stats.min_response_time_ms.toFixed(2)}ms`,
    `# Max Response: ${stats.max_response_time_ms.toFixed(2)}ms`,
    "",
    "request_num,status,duration_ms,success,timestamp_ms,error",
  ];

  // Add each request result
  stats.results.forEach((result, index) => {
    const error = result.error ? `"${result.error.replace(/"/g, '""')}"` : "";
    lines.push(
      `${index + 1},${result.status},${result.duration_ms.toFixed(2)},${result.success},${result.timestamp_ms.toFixed(2)},${error}`
    );
  });

  await writeTextFile(filePath, lines.join("\n"));
  return true;
}
