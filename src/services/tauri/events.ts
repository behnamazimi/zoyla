/**
 * Tauri Events Service - Event listener setup for backend communication
 */

import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { ProgressUpdate } from "../../types/api";

/** Event handler for progress updates */
export type ProgressHandler = (progress: ProgressUpdate) => void;

/** Event handler for cancellation */
export type CancelHandler = () => void;

/**
 * Sets up event listeners for load test events.
 * @param onProgress - Handler for progress updates
 * @param onCancel - Handler for test cancellation
 * @returns Cleanup function to remove listeners
 */
export async function setupEventListeners(
  onProgress: ProgressHandler,
  onCancel: CancelHandler
): Promise<UnlistenFn> {
  try {
    const unlisteners: UnlistenFn[] = [];

    const unlistenProgress = await listen<ProgressUpdate>("load-test-progress", (event) =>
      onProgress(event.payload)
    );
    unlisteners.push(unlistenProgress);

    const unlistenCancel = await listen("load-test-cancelled", () => onCancel());
    unlisteners.push(unlistenCancel);

    // Return combined cleanup function
    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  } catch {
    // Not running in Tauri (e.g., browser dev mode)
    return () => {};
  }
}
