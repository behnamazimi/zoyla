/**
 * Toolbar - Top application toolbar
 */

import { Github } from "lucide-react";
import { HistoryPanel } from "../features/history";
import { LayoutSettings } from "../features/settings";
import { KeyboardGuide } from "../features/shortcuts";
import * as styles from "./Toolbar.css";

/** GitHub repository URL */
const GITHUB_URL = "https://github.com/behnamazimi/zoyla";

/**
 * Application toolbar with global actions.
 */
export function Toolbar() {
  return (
    <div className={styles.toolbar} data-tauri-drag-region>
      <div className={styles.toolbarLeft} data-tauri-drag-region>
        <h1 className={styles.appTitle} data-tauri-drag-region>
          Zoyla
        </h1>
      </div>

      <div className={styles.toolbarRight}>
        {/* GitHub Link */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.toolbarLink}
          aria-label="View on GitHub"
        >
          <Github size={16} />
        </a>

        <div className={styles.toolbarDivider} />

        {/* Keyboard Shortcuts Popover */}
        <KeyboardGuide />

        {/* History Popover */}
        <HistoryPanel />

        {/* Layout Settings Popover */}
        <LayoutSettings />
      </div>
    </div>
  );
}
