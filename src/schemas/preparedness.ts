import { z } from 'zod';

/** Supported languages for the platform. */
export const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'ta'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Strict validation schema for the Monsoon Preparedness API request.
 * Validates location, family size, vulnerabilities, and language.
 * All string fields are length-bounded to prevent abuse.
 */
export const PreparednessRequestSchema = z.object({
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must not exceed 100 characters'),
  familySize: z
    .number()
    .int('Family size must be a whole number')
    .positive('Family size must be positive')
    .max(20, 'Family size must not exceed 20'),
  vulnerabilities: z
    .array(z.string().max(50, 'Each vulnerability must not exceed 50 characters'))
    .max(10, 'Maximum 10 vulnerabilities allowed')
    .optional()
    .default([]),
  language: z
    .enum(SUPPORTED_LANGUAGES, { message: 'Unsupported language code' })
    .optional()
    .default('en'),
});

export type PreparednessRequest = z.infer<typeof PreparednessRequestSchema>;
