/**
 * Clipboard Image Service - Copy DOM elements as images to clipboard
 */

import { writeImage } from "@tauri-apps/plugin-clipboard-manager";
import { Image } from "@tauri-apps/api/image";
import { toPng } from "html-to-image";

/** Options for capturing element as image */
export interface CaptureOptions {
  /** Background color for the image */
  backgroundColor?: string;
  /** Pixel ratio for high-DPI displays */
  pixelRatio?: number;
  /** CSS selector for elements to exclude */
  excludeSelector?: string;
}

const DEFAULT_OPTIONS: CaptureOptions = {
  backgroundColor: "#1a1a1e",
  pixelRatio: 2,
  excludeSelector: ".copy-button",
};

/**
 * Captures a DOM element as PNG and copies it to clipboard.
 * @param element - The DOM element to capture
 * @param options - Capture options
 * @returns Promise resolving to true on success
 */
export async function copyElementAsImage(
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<boolean> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Hide elements matching exclude selector
  const excludedElements: HTMLElement[] = [];
  if (opts.excludeSelector) {
    const elements = element.querySelectorAll(opts.excludeSelector);
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      excludedElements.push(htmlEl);
      htmlEl.style.visibility = "hidden";
    });
  }

  try {
    // Generate PNG data URL
    const dataUrl = await toPng(element, {
      backgroundColor: opts.backgroundColor,
      pixelRatio: opts.pixelRatio,
      filter: (node) => {
        // Also filter via class check as backup
        if (opts.excludeSelector && node.classList) {
          const selector = opts.excludeSelector.replace(".", "");
          return !node.classList.contains(selector);
        }
        return true;
      },
    });

    // Convert data URL to bytes
    const base64Data = dataUrl.split(",")[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Write to clipboard via Tauri
    const image = await Image.fromBytes(bytes);
    await writeImage(image);

    return true;
  } finally {
    // Restore visibility of excluded elements
    excludedElements.forEach((el) => {
      el.style.visibility = "";
    });
  }
}
