/**
 * Tauri Services Index - Backend communication
 *
 * Pure functions for Tauri API calls.
 * No state management - just async operations.
 *
 * @module services/tauri
 */

/** Execute a load test via Rust backend */
export { runLoadTest, cancelLoadTest, getCpuCount } from "./loadTest";

/** Setup event listeners for backend events */
export { setupEventListeners } from "./events";

/** Event handler types */
export type { ProgressHandler, CancelHandler } from "./events";
