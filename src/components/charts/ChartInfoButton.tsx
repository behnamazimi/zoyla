/**
 * ChartInfoButton - Info button with popover explaining chart meaning
 * Pure presentational component with no store access.
 */

import { useState } from "react";
import { Info } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as styles from "./charts.css";

interface ChartInfoButtonProps {
  /** Title of the chart */
  title: string;
  /** Detailed explanation of what the chart shows */
  description: string;
  /** How to read/interpret the chart */
  howToRead: string;
}

/**
 * Info button that shows a popover with chart explanation.
 * Displays an "i" icon that opens a popover with chart details.
 */
export function ChartInfoButton({ title, description, howToRead }: ChartInfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className={styles.chartInfoButton} aria-label={`Info about ${title}`}>
          <Info size={14} className={styles.chartInfoIcon} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.chartInfoPopover}
          side="top"
          sideOffset={8}
          onInteractOutside={() => {
            setOpen(false);
          }}
          onEscapeKeyDown={() => {
            setOpen(false);
          }}
        >
          <div className={styles.chartInfoContent}>
            <h4 className={styles.chartInfoTitle}>{title}</h4>
            <p className={styles.chartInfoDescription}>{description}</p>
            <div className={styles.chartInfoSection}>
              <strong className={styles.chartInfoLabel}>How to read:</strong>
              <p className={styles.chartInfoText}>{howToRead}</p>
            </div>
          </div>
          <Popover.Arrow className={styles.chartInfoArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
