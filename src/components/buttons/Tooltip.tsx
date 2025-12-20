/**
 * Tooltip - Radix UI Tooltip wrapper
 * Pure presentational component with no store access.
 */

import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import * as styles from "./buttons.css";

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

/**
 * A styled tooltip that wraps any element.
 */
export function Tooltip({ children, content, side = "bottom", delayDuration = 300 }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className={styles.tooltipContent} side={side} sideOffset={6}>
            {content}
            <RadixTooltip.Arrow className={styles.tooltipArrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
