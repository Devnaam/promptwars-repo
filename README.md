# Monsoon Preparedness & Citizen Assistance

GenAI-powered monsoon preparedness assistant for individuals, families, and communities. The app creates personalized before/during/after preparedness plans, weather-aware guidance, emergency checklists, travel advisories, multilingual assistance, and alert-ready safety messages.

## Submission Links

- Public GitHub Repository: add your repository URL here
- Deployed Application: add your deployed URL here

## What This Version Includes

- Personalized GenAI plans with distinct `before`, `during`, and `after` phases.
- Weather-aware prompt grounding using the shared weather snapshot service.
- Emergency checklist with per-phase progress tracking.
- Travel advisory, safety recommendations, medical/accessibility guidance, community actions, and recovery steps.
- Real-time alert center with before/during/after alert messages and browser speech-synthesis support.
- Multilingual UI and AI output targeting English, Hindi, Bengali, and Tamil.
- Copy, download, and print actions for offline preparedness.
- Responsive UI using the required challenge palette:
  - `#F9ED69`
  - `#F08A5D`
  - `#B83B5E`
  - `#6A2C70`
- Production-oriented validation, sanitization, typed API contracts, and rate limiting.

## GenAI Services Used

The project uses the Vercel AI SDK with Groq:

- Service file: `src/services/aiPlanService.ts`
- Model: `llama-3.3-70b-versatile`
- API route: `src/app/api/preparedness-plan/route.ts`

The GenAI service receives:

- User location
- Family size
- Household vulnerabilities
- Preferred response language
- Weather snapshot for the submitted location

It returns structured JSON validated by Zod:

- Phased preparedness plan
- Travel advisory
- Emergency checklists
- Safety recommendations
- Community actions
- Medical and accessibility guidance
- Recovery steps

## Weather-Aware Architecture

Weather intelligence is centralized in `src/services/weatherService.ts`.

The current implementation uses deterministic mock weather data for challenge/demo reliability. It is intentionally provider-ready: replace `getWeatherSnapshot` with OpenWeather, IMD, Tomorrow.io, or another provider without changing the API route or UI contracts.

Consumers:

- `src/app/api/weather/route.ts`
- `src/app/api/preparedness-plan/route.ts`
- `src/components/weather/WeatherAdvisory.tsx`
- `src/components/alerts/AlertCenter.tsx`

## Environment Variables

Create `.env.local`:

```bash
GROQ_API_KEY=your_groq_api_key
```

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Checks

```bash
npm run lint
npm run build
```

## Key Files

- `src/app/page.tsx` - app shell
- `src/components/dashboard/DashboardView.tsx` - main experience orchestration
- `src/components/forms/PersonalizedPlanForm.tsx` - household input and language selection
- `src/components/weather/WeatherAdvisory.tsx` - weather-aware advisory card
- `src/components/alerts/AlertCenter.tsx` - alert lifecycle and voice-ready alerts
- `src/components/plan/PlanActions.tsx` - copy/download/print
- `src/services/aiPlanService.ts` - GenAI plan generation
- `src/services/weatherService.ts` - weather snapshot provider abstraction
- `src/schemas/genai-response.ts` - validated GenAI output contract
- `src/schemas/preparedness.ts` - validated user input contract
