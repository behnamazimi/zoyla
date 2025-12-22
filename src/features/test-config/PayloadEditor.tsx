/**
 * PayloadEditor - Request body/payload editor for POST/PUT/PATCH methods
 * Container component connecting to testConfigStore.
 * Supports JSON, XML, form-urlencoded, plain text, and multipart/form-data with files.
 */

import * as Collapsible from "@radix-ui/react-collapsible";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { ChevronDown, ChevronRight, X, FileUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useTestConfigStore, useTestRunnerStore } from "../../store";
import { useUIStore } from "../../store";
import {
  validatePayload,
  getPlaceholderForContentType,
  type PayloadContentType,
} from "../../utils/payload";
import * as styles from "./test-config.css";

type PayloadMode = "raw" | "form-data";

/**
 * Expandable panel for editing request body payload.
 * Supports JSON, XML, form-urlencoded, plain text, and multipart/form-data with files.
 * Only visible when method is POST, PUT, or PATCH.
 */
export function PayloadEditor() {
  const { body, method, formFields, setBody, addFormField, removeFormField } = useTestConfigStore();
  const isRunning = useTestRunnerStore((s) => s.isRunning);
  const { showPayload, setShowPayload } = useUIStore();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [payloadMode, setPayloadMode] = useState<PayloadMode>("raw");

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
  const hasFormFields = formFields.some((f) => f.filePath);
  const contentTypeLabel =
    payloadMode === "form-data"
      ? "FORM"
      : hasBody
        ? contentType.split("/").pop()?.toUpperCase()
        : null;

  const handleAddFileField = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });

      if (selected) {
        const filePath = selected as string;
        const fileName = filePath.split("/").pop() || filePath.split("\\").pop() || "file";
        addFormField({
          id: crypto.randomUUID(),
          name: "file", // File fields always use "file" as the field name
          value: "",
          filePath,
          fileName,
        });
      }
    } catch {
      // File dialog was cancelled or failed
    }
  };

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
          {/* Mode Toggle */}
          <ToggleGroup.Root
            type="single"
            value={payloadMode}
            onValueChange={(value) => value && setPayloadMode(value as PayloadMode)}
            className={styles.payloadModeToggle}
          >
            <ToggleGroup.Item value="raw" disabled={isRunning} className={styles.payloadModeItem}>
              Raw
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="form-data"
              disabled={isRunning}
              className={styles.payloadModeItem}
            >
              Form Data
            </ToggleGroup.Item>
          </ToggleGroup.Root>

          {payloadMode === "raw" ? (
            <>
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
                  Content-Type: {contentType} is automatically detected. Override in Headers if
                  needed.
                </div>
              )}
              {!hasBody && (
                <div className={styles.payloadHint}>
                  Content-Type will be automatically detected.
                </div>
              )}
            </>
          ) : (
            <>
              {/* File Fields List */}
              <div className={styles.formFieldsList}>
                {formFields
                  .filter((f) => f.filePath)
                  .map((field) => (
                    <div key={field.id} className={styles.formFieldRow}>
                      <div className={styles.formFieldFile}>
                        <FileUp size={14} />
                        <span className={styles.formFieldFileName}>{field.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFormField(field.id)}
                        disabled={isRunning}
                        className={styles.headerRemoveBtn}
                        aria-label="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
              </div>

              {/* Add File Button */}
              <button
                type="button"
                onClick={handleAddFileField}
                disabled={isRunning}
                className={styles.addFormFieldBtn}
              >
                <FileUp size={14} />
                <span>Add File</span>
              </button>

              {hasFormFields && (
                <div className={styles.payloadHint}>
                  Content-Type: multipart/form-data will be used automatically.
                </div>
              )}
              {!hasFormFields && (
                <div className={styles.payloadHint}>
                  Select a file to send as multipart/form-data.
                </div>
              )}
            </>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
