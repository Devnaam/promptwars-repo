import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { PreparednessRequest, SupportedLanguage } from '@/schemas/preparedness';
import { GenAIResponse, GenAIResponseSchema } from '@/schemas/genai-response';
import { sanitizeField, sanitizeFieldArray } from '@/utils/sanitize';

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
};

export const AiPlanResponseSchema = GenAIResponseSchema;
export type AiPlanResponse = GenAIResponse;

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
1. preparednessPlan: Provide distinct instructions for 'before', 'during', and 'after' phases.
2. travelAdvisory: General travel safety guidance based on the location.
3. emergencyChecklists: Actionable lists for 'before', 'during', and 'after' phases.
4. safetyRecommendations: 4-6 concise safety recommendations tailored to the household vulnerabilities.

CRITICAL: Provide the ENTIRE response in ${languageName} language.
You MUST output your final answer strictly as a valid minified JSON object matching the requested schema wrapper format. Do not wrap the JSON in Markdown code block backticks (\`\`\`json) or write any introductory conversational text.`;
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
      providerOptions: {
        groq: { structuredOutputs: false },
      },
    });

    return object;
  } catch (error) {
    console.error('Error generating preparedness plan (falling back to default):', error);
    
    // Graceful fallback payload perfectly matching the AiPlanResponse schema
    const FALLBACK_PLAN: AiPlanResponse = {
      preparednessPlan: {
        before: "Stock up on at least 3 days of non-perishable food, water, and essential medications. Keep flashlights, extra batteries, and a first-aid kit in an accessible location. Clear drains and gutters around your home.",
        during: "Stay indoors and away from windows. Do not walk or drive through floodwaters, as even 15cm of moving water can knock you down. Tune into local emergency broadcasts for real-time updates.",
        after: "Wait for official clearance before returning home or traveling. Avoid contact with floodwater to prevent waterborne diseases. Check your home for structural damage and photograph it for insurance purposes."
      },
      travelAdvisory: "Avoid non-essential travel. Do not attempt to drive or walk through flooded areas. Keep emergency numbers handy.",
      emergencyChecklists: {
        before: ["3-day supply of food and water", "First-aid kit and essential medicines", "Flashlights and extra batteries", "Important documents in waterproof bags"],
        during: ["Stay tuned to emergency broadcasts", "Move to higher ground if flooding starts", "Disconnect electrical appliances"],
        after: ["Check family members for injuries", "Boil drinking water", "Report fallen power lines"]
      },
      safetyRecommendations: [
        "Keep phones charged and power banks ready.",
        "Share your plan with every household member.",
        "Avoid floodwater because it may hide open drains, debris, or live wires.",
        "Follow official alerts before resuming travel."
      ],
    };
    
    return FALLBACK_PLAN;
  }
}
