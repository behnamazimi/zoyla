/**
 * KeyboardGuide - Displays available keyboard shortcuts
 * Container component connecting to uiStore.
 */

import * as Popover from "@radix-ui/react-popover";
import { Keyboard, X } from "lucide-react";
import { useUIStore } from "../../store";
import { SHORTCUTS, getModifierKey } from "../../hooks/useKeyboardShortcuts";
import * as styles from "./shortcuts.css";
import * as toolbarStyles from "../../layouts/Toolbar.css";

/**
 * Formats a key for display, replacing 'mod' with the platform modifier.
 */
function formatKey(key: string): string {
  if (key === "mod") return getModifierKey();
  return key;
}

/**
 * Popover panel showing all keyboard shortcuts.
 */
export function KeyboardGuide() {
  const { showKeyboardGuide, setShowKeyboardGuide } = useUIStore();

  return (
    <Popover.Root open={showKeyboardGuide} onOpenChange={setShowKeyboardGuide}>
      <Popover.Trigger asChild>
        <button
          className={`${toolbarStyles.toolbarButton} ${showKeyboardGuide ? toolbarStyles.toolbarButtonActive : ""}`}
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.shortcutsPopoverContent} sideOffset={8} align="end">
          <div className={styles.shortcutsHeader}>
            <h3>Keyboard Shortcuts</h3>
            <Popover.Close asChild>
              <button className={styles.shortcutsCloseBtn} aria-label="Close">
                <X size={14} />
              </button>
            </Popover.Close>
          </div>

          <div className={styles.shortcutsContent}>
            <div className={styles.shortcutList}>
              {SHORTCUTS.map((shortcut, index) => (
                <div key={index} className={styles.shortcutRow}>
                  <div className={styles.shortcutKeys}>
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex}>
                        {keyIndex > 0 && <span className={styles.shortcutPlus}>+</span>}
                        <kbd className={styles.shortcutKey}>{formatKey(key)}</kbd>
                      </span>
                    ))}
                  </div>
                  <span className={styles.shortcutDescription}>{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
