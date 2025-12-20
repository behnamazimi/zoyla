/**
 * Hooks Index - Custom React hooks
 *
 * Architecture Notes:
 * - useTestRunner is the ONLY place where multiple stores interact
 * - Hooks encapsulate complex logic and side effects
 *
 * @module hooks
 */

/**
 * Orchestrates test execution across stores and services.
 * This is the single point of cross-store coordination.
 */
export { useTestRunner } from "./useTestRunner";

/** Provides sidebar resize functionality with mouse drag */
export { useResizable } from "./useResizable";

/** Loads persisted data (history, settings) on app mount */
export { usePersistence } from "./usePersistence";

/** Global keyboard shortcuts handler */
export { useKeyboardShortcuts, getModifierKey, SHORTCUTS } from "./useKeyboardShortcuts";
