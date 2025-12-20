/**
 * HeadersEditor - Custom HTTP headers management
 * Container component connecting to testConfigStore.
 */

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight, X, Plus } from "lucide-react";
import { useTestConfigStore } from "../../store";
import { useUIStore } from "../../store";
import * as styles from "./test-config.css";

/**
 * Expandable panel for managing custom HTTP headers.
 */
export function HeadersEditor() {
  const { headers, addHeader, updateHeader, removeHeader } = useTestConfigStore();
  const isRunning = false; // Will be connected via props from parent
  const { showHeaders, setShowHeaders } = useUIStore();

  const activeHeaderCount = headers.filter((h) => h.key.trim()).length;

  return (
    <Collapsible.Root
      open={showHeaders}
      onOpenChange={setShowHeaders}
      className={styles.configSection}
    >
      <Collapsible.Trigger className={styles.headersToggle}>
        <span className={styles.toggleIcon}>
          {showHeaders ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        <span className={styles.configLabel}>Headers</span>
        {activeHeaderCount > 0 && <span className={styles.headerCount}>{activeHeaderCount}</span>}
      </Collapsible.Trigger>

      <Collapsible.Content className={styles.headersContent}>
        <div className={styles.headersList}>
          {headers.map((header) => (
            <div key={header.id} className={styles.headerRow}>
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(header.id, "key", e.target.value)}
                placeholder="Header name"
                disabled={isRunning}
                className={styles.headerKey}
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(header.id, "value", e.target.value)}
                placeholder="Value"
                disabled={isRunning}
                className={styles.headerValue}
              />
              <button
                className={styles.headerRemoveBtn}
                onClick={() => removeHeader(header.id)}
                disabled={isRunning}
                title="Remove header"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.addHeaderBtn}
          onClick={addHeader}
          disabled={isRunning}
        >
          <Plus size={12} />
          <span>Add Header</span>
        </button>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
