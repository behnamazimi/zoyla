/**
 * Headers Parsing Utility
 * Parses headers from textarea format (standard HTTP header format)
 */

export interface ParsedHeader {
  key: string;
  value: string;
}

export interface HeaderValidationResult {
  isValid: boolean;
  errors: string[];
  parsedHeaders: ParsedHeader[];
}

/**
 * Parses headers from textarea text.
 * Supports standard HTTP header format: "Header-Name: value"
 *
 * Format examples:
 *   Content-Type: application/json
 *   Authorization: Bearer token123
 *   X-Custom-Header: value
 *
 * Also supports:
 *   - Empty lines (ignored)
 *   - Comments starting with # (ignored)
 *   - Multi-line values (not supported, each line is a separate header)
 */
export function parseHeaders(headersText: string): ParsedHeader[] {
  if (!headersText || headersText.trim() === "") {
    return [];
  }

  const lines = headersText.split("\n");
  const headers: ParsedHeader[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === "") {
      continue;
    }

    // Skip comments (lines starting with #)
    if (trimmed.startsWith("#")) {
      continue;
    }

    // Split on first colon (to handle values that contain colons)
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) {
      // No colon found, skip invalid line
      continue;
    }

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    // Skip if key is empty
    if (key === "") {
      continue;
    }

    headers.push({ key, value });
  }

  return headers;
}

/**
 * Formats headers array into textarea text format.
 */
export function formatHeaders(headers: ParsedHeader[]): string {
  return headers
    .filter((h) => h.key.trim() !== "")
    .map((h) => `${h.key}: ${h.value}`)
    .join("\n");
}

/**
 * Validates headers text and returns validation result with parsed headers.
 */
export function validateHeaders(headersText: string): HeaderValidationResult {
  const errors: string[] = [];
  const parsedHeaders: ParsedHeader[] = [];

  if (!headersText || headersText.trim() === "") {
    return {
      isValid: true,
      errors: [],
      parsedHeaders: [],
    };
  }

  const lines = headersText.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNumber = i + 1;

    // Skip empty lines
    if (trimmed === "") {
      continue;
    }

    // Skip comments
    if (trimmed.startsWith("#")) {
      continue;
    }

    // Check for colon
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) {
      errors.push(`Line ${lineNumber}: Missing colon separator (expected "Header-Name: value")`);
      continue;
    }

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    // Validate key
    if (key === "") {
      errors.push(`Line ${lineNumber}: Header name cannot be empty`);
      continue;
    }

    // Check for invalid characters in header name (HTTP header names should be alphanumeric with hyphens/underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      errors.push(
        `Line ${lineNumber}: Invalid header name "${key}" (only letters, numbers, hyphens, and underscores allowed)`
      );
      continue;
    }

    // Check for common header name issues
    if (key.includes(" ")) {
      errors.push(
        `Line ${lineNumber}: Header name "${key}" contains spaces (use hyphens instead, e.g., "Content-Type")`
      );
      continue;
    }

    // Value can be empty (some headers don't need values), but warn if suspicious
    if (value === "" && !key.toLowerCase().startsWith("x-")) {
      // Allow empty values for custom headers (X-*), but warn for standard headers
      // This is just a warning, not an error
    }

    parsedHeaders.push({ key, value });
  }

  // Check for duplicate header names (case-insensitive)
  const seenKeys = new Set<string>();
  for (const header of parsedHeaders) {
    const lowerKey = header.key.toLowerCase();
    if (seenKeys.has(lowerKey)) {
      errors.push(`Duplicate header "${header.key}" (HTTP headers are case-insensitive)`);
    }
    seenKeys.add(lowerKey);
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsedHeaders,
  };
}
