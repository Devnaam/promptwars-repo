import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { PreparednessRequest } from '@/schemas/preparedness';
import { sanitizeField, sanitizeFieldArray } from '@/utils/sanitize';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
};

/**
 * Strict Zod schema for validating the structured JSON response
 * returned by the Groq Llama model.
 */
export const AiPlanResponseSchema = z.object({
  personalizedPlan: z.object({
    before: z.string().min(1, 'Before-phase plan is required'),
    during: z.string().min(1, 'During-phase plan is required'),
    after: z.string().min(1, 'After-phase plan is required'),
  }),
  travelAdvisory: z.string().min(1, 'Travel advisory is required'),
  emergencyChecklist: z.object({
    before: z.array(z.string()).min(1),
    during: z.array(z.string()).min(1),
    after: z.array(z.string()).min(1),
  }),
});

export type AiPlanResponse = z.infer<typeof AiPlanResponseSchema>;

/**
 * Builds a phased prompt covering Before, During, and After monsoon phases.
 * All user inputs are sanitized before interpolation to prevent prompt injection.
 *
 * @param context - The validated and sanitized user request
 * @returns A prompt string for the GenAI model
 */
function buildPrompt(context: PreparednessRequest): string {
  const safeLocation = sanitizeField(context.location);
  const safeVulnerabilities = sanitizeFieldArray(context.vulnerabilities);
  const languageName = LANGUAGE_NAMES[context.language] ?? 'English';

  return `You are an expert disaster management consultant specializing in monsoon preparedness for the Indian subcontinent.

Generate a comprehensive, personalized monsoon preparedness plan for:
- Location: ${safeLocation}
- Household size: ${context.familySize} members
- Specific vulnerabilities: ${safeVulnerabilities.length > 0 ? safeVulnerabilities.join(', ') : 'None reported'}

You MUST structure your response strictly matching the JSON schema.
1. personalizedPlan: Provide distinct instructions for 'before', 'during', and 'after' phases.
2. travelAdvisory: General travel safety guidance based on the location.
3. emergencyChecklist: Actionable lists for 'before', 'during', and 'after' phases.

CRITICAL: Provide the ENTIRE response in ${languageName} language.`;
}

/**
 * Generates a personalized monsoon preparedness plan via the Vercel AI SDK using Groq.
 * Enforces the strict JSON response format using generateObject.
 *
 * @param context - Validated user request
 * @returns A strictly typed AiPlanResponse object
 */
export async function generatePreparednessPlan(context: PreparednessRequest): Promise<AiPlanResponse> {
  const prompt = buildPrompt(context);

  try {
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: AiPlanResponseSchema,
      prompt: prompt,
    });

    return object;
  } catch (error) {
    console.error('Error generating preparedness plan (falling back to default):', error);
    
    // Graceful fallback payload perfectly matching the AiPlanResponse schema
    const FALLBACK_PLAN: AiPlanResponse = {
      personalizedPlan: {
        before: "Stock up on at least 3 days of non-perishable food, water, and essential medications. Keep flashlights, extra batteries, and a first-aid kit in an accessible location. Clear drains and gutters around your home.",
        during: "Stay indoors and away from windows. Do not walk or drive through floodwaters, as even 15cm of moving water can knock you down. Tune into local emergency broadcasts for real-time updates.",
        after: "Wait for official clearance before returning home or traveling. Avoid contact with floodwater to prevent waterborne diseases. Check your home for structural damage and photograph it for insurance purposes."
      },
      travelAdvisory: "Avoid non-essential travel. Do not attempt to drive or walk through flooded areas. Keep emergency numbers handy.",
      emergencyChecklist: {
        before: ["3-day supply of food and water", "First-aid kit and essential medicines", "Flashlights and extra batteries", "Important documents in waterproof bags"],
        during: ["Stay tuned to emergency broadcasts", "Move to higher ground if flooding starts", "Disconnect electrical appliances"],
        after: ["Check family members for injuries", "Boil drinking water", "Report fallen power lines"]
      }
    };
    
    return FALLBACK_PLAN;
  }
}
