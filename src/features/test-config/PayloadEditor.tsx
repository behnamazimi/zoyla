/**
 * PayloadEditor - Request body/payload editor for POST/PUT/PATCH methods
 * Container component connecting to testConfigStore.
 */

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTestConfigStore, useTestRunnerStore } from "../../store";
import { useUIStore } from "../../store";
import {
  validatePayload,
  getPlaceholderForContentType,
  type PayloadContentType,
} from "../../utils/payload";
import * as styles from "./test-config.css";

/**
 * Expandable panel for editing request body payload.
 * Supports JSON, XML, form-urlencoded, and plain text with auto-detection.
 * Only visible when method is POST, PUT, or PATCH.
 */
export function PayloadEditor() {
  const { body, method, setBody } = useTestConfigStore();
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const { showPayload, setShowPayload } = useUIStore();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Detect content type and validate payload
  const payloadValidation = useMemo(() => validatePayload(body), [body]);
  const contentType: PayloadContentType = payloadValidation.contentType;
  const placeholder = useMemo(() => getPlaceholderForContentType(contentType), [contentType]);

  // Update validation error
  useEffect(() => {
    if (body.trim() === "") {
      setValidationError(null);
      return;
    }
    if (!payloadValidation.isValid) {
      setValidationError(payloadValidation.error || "Invalid payload");
    } else {
      setValidationError(null);
    }
  }, [body, payloadValidation]);

  // Only show for POST, PUT, PATCH methods
  const shouldShow = method === "POST" || method === "PUT" || method === "PATCH";
  if (!shouldShow) {
    return null;
  }

  const hasBody = body.trim().length > 0;
  const contentTypeLabel = hasBody ? contentType.split("/").pop()?.toUpperCase() : null;

  return (
    <Collapsible.Root
      open={showPayload}
      onOpenChange={setShowPayload}
      className={styles.configSection}
    >
      <Collapsible.Trigger className={styles.headersToggle}>
        <span className={styles.toggleIcon}>
          {showPayload ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        <span className={styles.configLabel}>Payload</span>
        {contentTypeLabel && <span className={styles.headerCount}>{contentTypeLabel}</span>}
      </Collapsible.Trigger>

      <Collapsible.Content className={styles.headersContent}>
        <div className={styles.payloadContainer}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            disabled={isRunning}
            className={styles.payloadTextarea}
            rows={4}
            spellCheck={false}
          />
          {validationError && <div className={styles.jsonError}>{validationError}</div>}
          {hasBody && (
            <div className={styles.payloadHint}>
              Content-Type: {contentType} is automatically detected. Override in Headers if needed.
            </div>
          )}
          {!hasBody && (
            <div className={styles.payloadHint}>Content-Type will be automatically detected.</div>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
