import { z } from 'zod';

/**
 * Strict validation schema for the Monsoon Preparedness request.
 * Ensures the location is present, family size is a sensible positive integer,
 * and vulnerabilities are provided as an array of strings.
 */
export const PreparednessRequestSchema = z.object({
  location: z.string().min(2, "Location must be at least 2 characters").max(100),
  familySize: z.number().int().positive().max(20),
  vulnerabilities: z.array(z.string()).max(10).optional().default([]),
});

export type PreparednessRequest = z.infer<typeof PreparednessRequestSchema>;
