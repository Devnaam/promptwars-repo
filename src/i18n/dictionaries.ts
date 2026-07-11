export const dictionaries = {
  en: {
    dashboardTitle: "Monsoon Preparedness & Citizen Assistance",
    dashboardSubtitle: "Stay safe, stay informed. Generate your personalized action plan today.",
    formTitle: "Create Your Personalized Plan",
    locationLabel: "City / Location",
    locationPlaceholder: "e.g., Mumbai, Maharashtra",
    familySizeLabel: "Family Size",
    vulnerabilitiesLabel: "Vulnerabilities (Optional, comma-separated)",
    vulnerabilitiesPlaceholder: "e.g., elderly, infant, asthma",
    submitButton: "Generate Plan",
    submittingButton: "Generating...",
    planResultsTitle: "Your Preparedness Plan",
    emergencyChecklistsTitle: "Emergency Checklists",
    safetyRecommendationsTitle: "Safety Recommendations",
    weatherAdvisoryTitle: "Real-Time Weather Advisory",
    weatherWarning: "Heavy Rainfall Warning",
    weatherDetail: "Expect continuous downpours over the next 48 hours. Secure loose items and prepare emergency kits.",
    errorMessage: "An error occurred while generating the plan. Please try again.",
    validationError: "Please check your inputs and try again.",
  },
  // Placeholders for future languages
  hi: {
    dashboardTitle: "मानसून की तैयारी और नागरिक सहायता",
    // Fallbacks handled in context for missing keys
  }
};

export type Dictionary = typeof dictionaries.en;
export type ValidLocale = keyof typeof dictionaries;
