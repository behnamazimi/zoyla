/**
 * ResizeHandle - Drag handle for resizable panels
 * Pure presentational component with no store access.
 */

import type { ResizeHandleProps } from "../../types/components";
import * as styles from "./layout.css";

/**
 * A vertical drag handle for resizing adjacent panels.
 */
export function ResizeHandle({ onResizeStart }: ResizeHandleProps) {
  return <div className={styles.resizeHandle} onMouseDown={onResizeStart} />;
}
