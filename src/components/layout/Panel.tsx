/**
 * Panel - Base panel component for all panel-like containers
 * Pure presentational component with no store access.
 *
 * Use this as the base for:
 * - SummaryPanel, StatusCodesPanel, ErrorLogsPanel
 * - Chart panels in ChartsGrid
 * - Any other panel-like containers
 */

import { forwardRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CopyButton } from "../buttons";
import * as styles from "./layout.css";

export interface PanelProps {
  /** Panel title - displays with section indicator */
  title?: string;
  /** Panel content */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Enable collapsible behavior */
  collapsible?: boolean;
  /** Initial expanded state (only when collapsible) */
  defaultExpanded?: boolean;
  /** Content to render in the header (right side) */
  headerAction?: ReactNode;
  /** Enable copy-to-clipboard button */
  copyable?: boolean;
  /** Title for copy button tooltip */
  copyTitle?: string;
  /** Hide the section indicator bar before title */
  hideTitleIndicator?: boolean;
  /** Render without default panel styling (just the structure) */
  unstyled?: boolean;
}

/**
 * A flexible panel container with optional:
 * - Collapsible behavior
 * - Copy-to-clipboard support
 * - Section title with indicator
 * - Custom header actions
 *
 * @example
 * // Basic panel
 * <Panel title="Summary">
 *   <Content />
 * </Panel>
 *
 * @example
 * // Copyable panel with header action
 * <Panel title="Results" copyable copyTitle="Results" headerAction={<ExportButton />}>
 *   <Content />
 * </Panel>
 *
 * @example
 * // Collapsible panel
 * <Panel title="Details" collapsible defaultExpanded={false}>
 *   <Content />
 * </Panel>
 */
export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      title,
      children,
      className = "",
      collapsible = false,
      defaultExpanded = true,
      headerAction,
      copyable = false,
      copyTitle,
      hideTitleIndicator = false,
      unstyled = false,
    },
    ref
  ) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const handleToggle = () => {
      if (collapsible) {
        setExpanded(!expanded);
      }
    };

    const panelClass = unstyled ? className : `${styles.panel} ${className}`;
    const titleClass = hideTitleIndicator ? styles.panelTitle : styles.panelTitleWithIndicator;

    return (
      <div className={panelClass} ref={ref}>
        {title && (
          <div className={styles.panelHeader}>
            <h3
              className={`${titleClass} ${collapsible ? styles.panelTitleCollapsible : ""}`}
              onClick={handleToggle}
            >
              {collapsible && (
                <span className={styles.collapseIcon}>
                  {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
              )}
              {title}
            </h3>
            <div className={styles.panelActions}>
              {copyable && ref && "current" in ref && (
                <CopyButton
                  targetRef={ref as React.RefObject<HTMLDivElement>}
                  title={copyTitle || title}
                />
              )}
              {headerAction}
            </div>
          </div>
        )}
        {(!collapsible || expanded) && <div className={styles.panelContent}>{children}</div>}
      </div>
    );
  }
);

Panel.displayName = "Panel";
