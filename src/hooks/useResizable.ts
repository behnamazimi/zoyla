/**
 * useResizable - Hook for resizable panel functionality
 */

import { useCallback, useEffect, useRef } from "react";
import { useUIStore } from "../store";
import { SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH } from "../constants/defaults";

/**
 * Hook that provides resize functionality for the sidebar.
 * Returns a ref for the sidebar and a handler for starting resize.
 */
export function useResizable() {
  const { sidebarWidth, setSidebarWidth } = useUIStore();
  const sidebarRef = useRef<HTMLElement>(null);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return;

      const newWidth = e.clientX;
      if (newWidth >= SIDEBAR_MIN_WIDTH && newWidth <= SIDEBAR_MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    },
    [setSidebarWidth]
  );

  useEffect(() => {
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResizing);

    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return {
    sidebarRef,
    sidebarWidth,
    startResizing,
  };
}
