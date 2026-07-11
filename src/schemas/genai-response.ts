import { z } from 'zod';

/**
 * Strict Zod schema for validating the structured JSON response
 * returned by the GenAI model. This prevents trusting
 * arbitrary JSON from the model and enforces the expected contract.
 */
export const PhaseTextSchema = z.object({
  before: z.string().min(1, 'Before-phase plan is required'),
  during: z.string().min(1, 'During-phase plan is required'),
  after: z.string().min(1, 'After-phase plan is required'),
});

export const PhaseChecklistSchema = z.object({
  before: z.array(z.string().min(1)).min(1),
  during: z.array(z.string().min(1)).min(1),
  after: z.array(z.string().min(1)).min(1),
});

export const GenAIResponseSchema = z.object({
  preparednessPlan: PhaseTextSchema,
  travelAdvisory: z.string().min(1, 'Travel advisory is required'),
  emergencyChecklists: PhaseChecklistSchema,
  safetyRecommendations: z.array(z.string()).min(1),
  communityActions: z.array(z.string().min(1)).min(1),
  medicalAndAccessibility: z.array(z.string().min(1)).min(1),
  recoverySteps: z.array(z.string().min(1)).min(1),
});

export type GenAIResponse = z.infer<typeof GenAIResponseSchema>;
export type WeatherPhase = keyof z.infer<typeof PhaseTextSchema>;
