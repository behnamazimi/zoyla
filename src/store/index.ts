/**
 * Store Index - Re-exports all Zustand stores
 *
 * Architecture Notes:
 * - Stores are INDEPENDENT - they do not import each other
 * - Cross-store coordination happens in hooks (useTestRunner)
 * - Each store manages a single domain of state
 *
 * @module store
 */

/** Test configuration state (URL, method, headers, etc.) */
export { useTestConfigStore } from "./testConfigStore";

/** Test execution state (running, progress, results, errors) */
export { useTestRunnerStore } from "./testRunnerStore";

/** UI preferences state (sidebar width, panel visibility) */
export { useUIStore } from "./uiStore";

/** Test history state (saved test results) */
export { useHistoryStore } from "./historyStore";
