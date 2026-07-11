import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { PreparednessRequest, SupportedLanguage } from '@/schemas/preparedness';
import { GenAIResponse, GenAIResponseSchema } from '@/schemas/genai-response';
import { sanitizeField, sanitizeFieldArray } from '@/utils/sanitize';
import type { WeatherSnapshot } from '@/services/weatherService';

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
function buildPrompt(context: PreparednessRequest, weather?: WeatherSnapshot): string {
  const safeLocation = sanitizeField(context.location);
  const safeVulnerabilities = sanitizeFieldArray(context.vulnerabilities);
  const languageName = LANGUAGE_NAMES[context.language] ?? 'English';
  const weatherContext = weather
    ? `Current weather intelligence:
- Rainfall: ${weather.rainfallMm} mm
- Wind: ${weather.windSpeedKmh} km/h
- Visibility: ${weather.visibilityKm} km
- Flood risk: ${weather.floodRiskPercent}%
- Severity: ${weather.severity}
- Weather recommendation: ${weather.recommendation}`
    : 'Current weather intelligence: unavailable; provide conservative monsoon guidance.';

  return `You are an expert disaster management consultant specializing in monsoon preparedness for the Indian subcontinent.

Generate a comprehensive, personalized monsoon preparedness plan for:
- Location: ${safeLocation}
- Household size: ${context.familySize} members
- Specific vulnerabilities: ${safeVulnerabilities.length > 0 ? safeVulnerabilities.join(', ') : 'None reported'}

${weatherContext}

You MUST structure your response strictly matching the JSON schema.
1. preparednessPlan: Provide distinct instructions for 'before', 'during', and 'after' phases.
2. travelAdvisory: General travel safety guidance based on the location.
3. emergencyChecklists: Actionable lists for 'before', 'during', and 'after' phases.
4. safetyRecommendations: 4-6 concise safety recommendations tailored to the household vulnerabilities.
5. communityActions: 3-5 actions that neighbors, resident associations, schools, or local volunteers can coordinate.
6. medicalAndAccessibility: 3-5 accessibility-aware actions for elderly people, infants, people with disabilities, chronic illness, or medication needs.
7. recoverySteps: 3-5 post-event recovery actions covering sanitation, damage documentation, official reporting, and safe return.

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
export async function generatePreparednessPlan(
  context: PreparednessRequest,
  weather?: WeatherSnapshot
): Promise<AiPlanResponse> {
  const prompt = buildPrompt(context, weather);

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
      communityActions: [
        "Create a neighbor check-in group for elderly residents and people living alone.",
        "Identify elevated safe points and share them with your housing society or street group.",
        "Keep a shared list of local emergency numbers, shelters, pharmacies, and repair services."
      ],
      medicalAndAccessibility: [
        "Store medicines, prescriptions, and assistive devices in waterproof bags.",
        "Plan evacuation support for anyone with limited mobility before rainfall peaks.",
        "Keep infant supplies, inhalers, and chronic-care equipment ready for at least 72 hours."
      ],
      recoverySteps: [
        "Use boiled or officially cleared water until local authorities confirm safety.",
        "Photograph damage before cleanup for insurance or relief claims.",
        "Report blocked drains, fallen power lines, and contaminated water to local authorities."
      ],
    };
    
    return FALLBACK_PLAN;
  }
}
