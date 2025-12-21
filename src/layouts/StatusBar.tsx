/**
 * StatusBar - Bottom status bar with version and author info
 */

import * as styles from "./StatusBar.css";

/** Author Twitter URL */
const AUTHOR_URL = "https://x.com/baz7c8";

/**
 * Bottom status bar displaying version and author information.
 */
export function StatusBar() {
  return (
    <div className={styles.statusBar}>
      <div className={styles.statusBarLeft}>
        <span className={styles.versionText}>v{__APP_VERSION__}</span>
      </div>

      <div className={styles.statusBarRight}>
        <a
          href={AUTHOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.authorLink}
        >
          by @baz7c8
        </a>
      </div>
    </div>
  );
}
