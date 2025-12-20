/**
 * Component Types - Prop types for reusable components
 */

/** Copy button props */
export interface CopyButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  title: string;
}

/** Progress bar props */
export interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

/** Stat card props */
export interface StatCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "accent" | "success" | "error" | "warning";
  className?: string;
}

/** Status badge props */
export interface StatusBadgeProps {
  code: number;
  count?: number;
}

/** Error message props */
export interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

/** Resize handle props */
export interface ResizeHandleProps {
  onResizeStart: () => void;
}
