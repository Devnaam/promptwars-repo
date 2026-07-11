import { generatePreparednessPlan } from '@/services/gemini';

jest.mock('@google/genai', () => {
  const generateContentMock = jest.fn();
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: generateContentMock
        }
      };
    }),
    Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY' },
    generateContentMock // Export it to access in tests
  };
});

const { generateContentMock } = require('@google/genai');

describe('GenAI Service: generatePreparednessPlan', () => {
  beforeEach(() => {
    generateContentMock.mockClear();
  });

  it('should return a structured plan on successful generation', async () => {
    const mockPlan = {
      preparednessPlan: "Test Plan",
      emergencyChecklists: ["Item 1", "Item 2"],
      safetyRecommendations: ["Stay safe"]
    };

    generateContentMock.mockResolvedValue({
      text: JSON.stringify(mockPlan)
    });

    const context = {
      location: 'Mumbai',
      familySize: 4,
      vulnerabilities: ['asthma'],
      language: 'en'
    };

    const result = await generatePreparednessPlan(context);
    expect(result).toEqual(mockPlan);
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    
    // Verify prompt included the language constraint
    const args = generateContentMock.mock.calls[0][0];
    expect(args.contents).toContain("translated into the 'en' language");
    expect(args.contents).toContain("Mumbai");
    expect(args.contents).toContain("asthma");
  });

  it('should throw an error if GenAI returns empty text', async () => {
    generateContentMock.mockResolvedValue({ text: null });

    const context = {
      location: 'Delhi',
      familySize: 2,
      vulnerabilities: [],
      language: 'hi'
    };

    await expect(generatePreparednessPlan(context)).rejects.toThrow("Failed to generate preparedness plan");
  });
});
