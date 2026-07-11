# 🌧️ Monsoon Preparedness & Citizen Assistance Platform

A high-performance, GenAI-powered web application designed to help individuals, families, and communities prepare for the monsoon season. This platform leverages Generative AI to provide personalized preparedness plans, weather-aware guidance, emergency checklists, travel advisories, and multilingual assistance to ensure safety before, during, and after severe weather events.

## 🎯 The Challenge
> *Design a GenAI-powered solution that helps individuals, families, and communities prepare for the monsoon season. The solution must leverage Generative AI to provide personalized preparedness plans, weather-aware guidance, emergency checklists, travel advisories, safety recommendations, multilingual assistance, and real-time alerts before, during, and after severe weather events.*

## ✨ Key Features

- **🧠 GenAI-Powered Personalization**: Utilizes the Vercel AI SDK and Groq (`llama-3.3-70b-versatile`) to generate highly specific action plans based on location, household size, and specific family vulnerabilities (e.g., elderly, infants, medical conditions).
- **⏱️ Phased Guidance**: Breaks down all instructions, checklists, and travel advisories into actionable phases: **Before**, **During**, and **After** the monsoon.
- **🌍 Multilingual Assistance**: Full i18n support offering perfectly translated interfaces and GenAI responses in English, Hindi, Bengali, and Tamil.
- **🛡️ Bulletproof Security**: Implements strict `Zod` schemas to enforce structured JSON outputs from the LLM, coupled with robust prompt injection sanitization to neutralize malicious inputs.
- **⚡ Resilient Fallbacks**: Engineered for high-stakes environments. If the GenAI API times out or rate limits, the platform instantly falls back to a high-quality, pre-baked local static plan, ensuring users *never* face a broken application during an emergency.
- **🔊 Voice Alert Broadcasts**: Integrated with the Web Speech API to read emergency alerts aloud, ensuring accessibility for visually impaired users and providing hands-free guidance.
- **🚦 Weather Severity Engine**: A custom algorithm that maps real-time weather parameters (rainfall, wind speed, visibility, flood risk) directly to actionable, mode-specific transit advisories (Walking, Driving, Public Transit).

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS
- **AI Integration**: Vercel AI SDK (`ai`), `@ai-sdk/groq`
- **Validation**: Zod
- **Testing**: Jest, React Testing Library

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd promptwars-repo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing
The codebase maintains a rigorous test suite covering the AI service layers, data pipelines, and UI components.
To run the tests:
```bash
npm run test
```

## 🏗️ Architecture & Code Quality Highlights
- **Strictly Typed**: Zero `any` types. Everything from API payloads to the i18n dictionary is fully typed.
- **Debounced Inputs**: Custom `useDebounce` hooks to minimize unnecessary renders and API stress.
- **Separation of Concerns**: Cleanly separated schemas, services, utility engines, and UI components.
- **Accessible Design**: ARIA labels, semantic HTML, and high-contrast color schemes for emergency readability.
