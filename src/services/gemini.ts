import { GoogleGenAI, Type, Schema } from '@google/genai';
import { PreparednessRequest } from '@/schemas/preparedness';

// Initialize the GenAI SDK
// It automatically picks up the GEMINI_API_KEY from the environment.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

/**
 * Service function to interact with the Gemini API.
 * Uses structured outputs to enforce a strictly typed JSON response format.
 * 
 * @param context User details (location, family size, vulnerabilities)
 * @returns Parsed JSON containing preparedness plan, checklists, and recommendations
 */
export async function generatePreparednessPlan(context: PreparednessRequest) {
  // Construct the contextual prompt for the GenAI model
  const prompt = `Act as an expert in disaster management and monsoon preparedness. 
Generate a personalized monsoon preparedness plan for a family of ${context.familySize} located in ${context.location}. 
Their vulnerabilities include: ${context.vulnerabilities.length > 0 ? context.vulnerabilities.join(', ') : 'None'}.
CRITICAL INSTRUCTION: You MUST provide the ENTIRE response translated into the '${context.language}' language.`;

  // Define the required structured JSON output schema
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      preparednessPlan: {
        type: Type.STRING,
        description: "A detailed personalized monsoon preparedness plan.",
      },
      emergencyChecklists: {
        type: Type.ARRAY,
        description: "Actionable emergency checklists.",
        items: {
          type: Type.STRING,
        },
      },
      safetyRecommendations: {
        type: Type.ARRAY,
        description: "General safety recommendations tailored to their vulnerabilities.",
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["preparednessPlan", "emergencyChecklists", "safetyRecommendations"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      throw new Error("No response text returned from GenAI.");
    }
    
    // Parse and return the structured JSON response
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating preparedness plan:", error);
    throw new Error("Failed to generate preparedness plan");
  }
}
