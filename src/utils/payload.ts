/**
 * Payload Content Type Detection and Validation
 */

export type PayloadContentType =
  | "application/json"
  | "application/xml"
  | "application/x-www-form-urlencoded"
  | "text/plain";

export interface PayloadValidationResult {
  contentType: PayloadContentType;
  isValid: boolean;
  error?: string;
}

/**
 * Detects content type based on payload content.
 */
export function detectContentType(payload: string): PayloadContentType {
  const trimmed = payload.trim();

  if (trimmed === "") {
    return "text/plain";
  }

  // Check for JSON (starts with { or [)
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "application/json";
    } catch {
      // Not valid JSON, continue checking other types
    }
  }

  // Check for XML (starts with <)
  if (trimmed.startsWith("<")) {
    // Basic XML detection - check for common XML patterns
    if (
      trimmed.includes("<?xml") ||
      trimmed.match(/<[a-zA-Z][^>]*>/) ||
      trimmed.match(/<\/[a-zA-Z][^>]*>/)
    ) {
      return "application/xml";
    }
  }

  // Check for URL-encoded form data (key=value&key2=value2 pattern)
  // Must not start with < or { or [
  if (
    !trimmed.startsWith("<") &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[") &&
    trimmed.includes("=") &&
    (trimmed.includes("&") || !trimmed.includes("\n"))
  ) {
    // Check if it matches form data pattern
    const formDataPattern = /^[^=]+=[^&]*(&[^=]+=[^&]*)*$/;
    if (formDataPattern.test(trimmed.split("\n")[0] || "")) {
      return "application/x-www-form-urlencoded";
    }
  }

  // Default to plain text
  return "text/plain";
}

/**
 * Validates payload based on detected content type.
 */
export function validatePayload(payload: string): PayloadValidationResult {
  const trimmed = payload.trim();

  if (trimmed === "") {
    return {
      contentType: "text/plain",
      isValid: true,
    };
  }

  const contentType = detectContentType(trimmed);

  switch (contentType) {
    case "application/json":
      try {
        JSON.parse(trimmed);
        return {
          contentType,
          isValid: true,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid JSON";
        return {
          contentType,
          isValid: false,
          error: message,
        };
      }

    case "application/xml":
      // Basic XML validation - check for balanced tags
      const openTags = (trimmed.match(/<[^/][^>]*>/g) || []).length;
      const closeTags = (trimmed.match(/<\/[^>]+>/g) || []).length;
      if (openTags !== closeTags && !trimmed.includes("<?xml")) {
        return {
          contentType,
          isValid: false,
          error: "XML tags may be unbalanced",
        };
      }
      return {
        contentType,
        isValid: true,
      };

    case "application/x-www-form-urlencoded":
      // Basic validation - check for key=value pairs
      const pairs = trimmed.split("&");
      const invalidPairs = pairs.filter((pair) => !pair.includes("="));
      if (invalidPairs.length > 0) {
        return {
          contentType,
          isValid: false,
          error: "Invalid form data format (expected key=value pairs)",
        };
      }
      return {
        contentType,
        isValid: true,
      };

    case "text/plain":
    default:
      return {
        contentType,
        isValid: true,
      };
  }
}

/**
 * Gets placeholder text based on content type.
 */
export function getPlaceholderForContentType(contentType: PayloadContentType): string {
  switch (contentType) {
    case "application/json":
      return '{"key": "value"}  (Auto-detects: JSON, XML, Form Data, Plain Text)';
    case "application/xml":
      return '<?xml version="1.0"?>\n<root>\n  <item>value</item>\n</root>\n(Auto-detects: JSON, XML, Form Data, Plain Text)';
    case "application/x-www-form-urlencoded":
      return "key1=value1&key2=value2  (Auto-detects: JSON, XML, Form Data, Plain Text)";
    case "text/plain":
      return "Enter payload (Auto-detects: JSON, XML, Form Data, Plain Text)...";
  }
}
