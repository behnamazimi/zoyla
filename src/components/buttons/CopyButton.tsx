/**
 * CopyButton - Copy to clipboard button
 * Pure presentational component with no store access.
 */

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import type { CopyButtonProps } from "../../types/components";
import { copyElementAsImage } from "../../services/clipboard";
import * as styles from "./buttons.css";

/**
 * A button that copies a referenced element as an image to clipboard.
 */
export function CopyButton({ targetRef, title }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!targetRef.current || copying) return;

    setCopying(true);
    try {
      await copyElementAsImage(targetRef.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently handle copy errors
    } finally {
      setCopying(false);
    }
  }, [targetRef, copying]);

  const buttonClass = `${styles.copyButton} ${copied ? styles.copyButtonCopied : ""} ${copying ? styles.copyButtonCopying : ""} copy-button`;

  return (
    <button
      className={buttonClass}
      onClick={handleCopy}
      title={`Copy ${title} to clipboard`}
      disabled={copying}
    >
      {copying ? (
        <span className={styles.copySpinner} />
      ) : copied ? (
        <Check size={14} className={styles.copyIcon} />
      ) : (
        <Copy size={14} className={styles.copyIcon} />
      )}
    </button>
  );
}
