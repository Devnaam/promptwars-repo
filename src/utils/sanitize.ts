/**
 * Input sanitization utilities to neutralize prompt injection attacks.
 * Strips control characters, excessive whitespace, and known injection patterns
 * before user strings are interpolated into GenAI prompts.
 */

/** Maximum allowed length for any single user-provided text field. */
const MAX_FIELD_LENGTH = 200;

/** Patterns commonly used in prompt injection attempts. */
const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)/gi,
  /you\s+are\s+now/gi,
  /system\s*:\s*/gi,
  /\{\{.*?\}\}/g,
  /<\|.*?\|>/g,
  /```[\s\S]*?```/g,
] as const;

/**
 * Sanitizes a single string field for safe prompt interpolation.
 * - Trims and truncates to MAX_FIELD_LENGTH
 * - Removes control characters (except standard whitespace)
 * - Neutralizes known prompt injection patterns
 *
 * @param input - The raw user input string
 * @returns A sanitized string safe for GenAI prompt interpolation
 */
export function sanitizeField(input: string): string {
  let sanitized = input.trim().slice(0, MAX_FIELD_LENGTH);

  // Strip control characters (keep tabs, newlines, spaces)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Neutralize injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized;
}

/**
 * Sanitizes an array of string fields (e.g., vulnerabilities list).
 * Applies sanitizeField to each element and filters out empty strings.
 *
 * @param inputs - Array of raw user input strings
 * @returns Array of sanitized, non-empty strings
 */
export function sanitizeFieldArray(inputs: string[]): string[] {
  return inputs
    .map(sanitizeField)
    .filter((s): s is string => s.length > 0);
}
