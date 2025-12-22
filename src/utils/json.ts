/**
 * JSON Validation Utility
 */

export interface JsonValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates JSON string and returns validation result.
 * Empty string is considered valid (no body).
 */
export function validateJson(jsonString: string): JsonValidationResult {
  // Empty string is valid (no body)
  if (jsonString.trim() === "") {
    return { valid: true };
  }

  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return { valid: false, error: message };
  }
}
