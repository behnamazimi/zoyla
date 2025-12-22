/**
 * HeadersEditor - Custom HTTP headers management
 * Container component connecting to testConfigStore.
 */

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTestConfigStore, useTestRunnerStore } from "../../store";
import { useUIStore } from "../../store";
import { validateHeaders } from "../../utils/headers";
import * as styles from "./test-config.css";

/**
 * Expandable panel for managing custom HTTP headers.
 * Uses textarea with standard HTTP header format: "Header-Name: value"
 */
export function HeadersEditor() {
  const { headers, setHeaders } = useTestConfigStore();
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const { showHeaders, setShowHeaders } = useUIStore();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate headers on change
  const headerValidation = useMemo(() => validateHeaders(headers), [headers]);
  const parsedHeaders = headerValidation.parsedHeaders;
  const activeHeaderCount = parsedHeaders.length;

  // Update validation errors
  useEffect(() => {
    if (headers.trim() === "") {
      setValidationErrors([]);
      return;
    }
    if (!headerValidation.isValid) {
      setValidationErrors(headerValidation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [headers, headerValidation]);

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
        <div className={styles.payloadContainer}>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder="Content-Type: application/json&#10;Authorization: Bearer token123&#10;X-Custom-Header: value"
            disabled={isRunning}
            className={styles.payloadTextarea}
            rows={4}
            spellCheck={false}
          />
          {validationErrors.length > 0 && (
            <div className={styles.jsonError}>
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          <div className={styles.payloadHint}>
            Format: Header-Name: value (one per line). Lines starting with # are ignored.
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
