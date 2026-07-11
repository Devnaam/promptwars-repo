import { z } from 'zod';

/**
 * Strict Zod schema for validating the structured JSON response
 * returned by the Gemini GenAI model. This prevents trusting
 * arbitrary JSON from the model and enforces the expected contract.
 */
export const GenAIResponseSchema = z.object({
  preparednessPlan: z.object({
    before: z.string().min(1, 'Before-phase plan is required'),
    during: z.string().min(1, 'During-phase plan is required'),
    after: z.string().min(1, 'After-phase plan is required'),
  }),
  emergencyChecklists: z.object({
    before: z.array(z.string()).min(1),
    during: z.array(z.string()).min(1),
    after: z.array(z.string()).min(1),
  }),
  safetyRecommendations: z.array(z.string()).min(1),
});

export type GenAIResponse = z.infer<typeof GenAIResponseSchema>;
