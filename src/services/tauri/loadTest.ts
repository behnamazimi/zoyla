/**
 * Load Test Service - Tauri API calls for load test execution
 * Pure functions with no side effects beyond API calls.
 */

import { invoke } from "@tauri-apps/api/core";
import type { TestConfig, LoadTestStats } from "../../types/api";

/**
 * Checks if running in Tauri environment.
 */
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Executes a load test via Tauri backend.
 * @param config - Test configuration
 * @returns Promise resolving to test statistics
 */
export async function runLoadTest(config: TestConfig): Promise<LoadTestStats> {
  if (!isTauri()) {
    throw new Error("Load testing requires the Tauri app. Run with: npm run tauri dev");
  }
  return invoke<LoadTestStats>("run_load_test", { config });
}

/**
 * Cancels a running load test.
 * Sets the cancellation flag in the backend.
 */
export async function cancelLoadTest(): Promise<void> {
  if (!isTauri()) {
    return;
  }
  return invoke("cancel_load_test");
}

/**
 * Gets the number of available CPU cores on this machine.
 * @returns Promise resolving to the CPU count
 */
export async function getCpuCount(): Promise<number> {
  if (!isTauri()) {
    // Fallback for browser environment (navigator.hardwareConcurrency)
    return navigator.hardwareConcurrency || 4;
  }
  return invoke<number>("get_available_cpus");
}
