/**
 * Audio Broadcast Utility Framework
 * Provides a voice-ready interface for broadcasting emergency alerts
 * using the Web Speech Synthesis API. Designed as a pluggable framework
 * that can be swapped for a real streaming TTS service (e.g., Google Cloud TTS).
 */

/** Supported languages for voice broadcast. */
export type BroadcastLanguage = 'en' | 'hi' | 'bn' | 'ta';

/** Language-to-BCP47 voice tag mapping for the Web Speech API. */
const LANGUAGE_VOICE_MAP: Record<BroadcastLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
} as const;

/** Result of a broadcast attempt. */
export interface BroadcastResult {
  readonly success: boolean;
  readonly message: string;
  readonly engine: 'web-speech-api' | 'mock-tts';
}

/**
 * Checks whether the Web Speech Synthesis API is available in the current browser.
 *
 * @returns true if speech synthesis is supported
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Broadcasts an emergency alert message via text-to-speech.
 * Uses the native Web Speech Synthesis API when available, otherwise
 * returns a mock result indicating the framework is ready for a real TTS backend.
 *
 * @param message - The alert text to broadcast
 * @param language - The target language for voice synthesis
 * @returns A promise resolving to a BroadcastResult
 */
export async function broadcastAlert(
  message: string,
  language: BroadcastLanguage
): Promise<BroadcastResult> {
  if (!isSpeechSupported()) {
    // Graceful degradation: log intent and return mock result
    console.info('[AudioBroadcast] Speech API unavailable. Mock broadcast:', { message, language });
    return {
      success: true,
      message: `[Mock TTS] Would broadcast in ${language}: "${message.slice(0, 80)}..."`,
      engine: 'mock-tts',
    };
  }

  return new Promise<BroadcastResult>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = LANGUAGE_VOICE_MAP[language];
    utterance.rate = 0.9; // Slightly slower for emergency clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      resolve({
        success: true,
        message: `Broadcast complete in ${language}.`,
        engine: 'web-speech-api',
      });
    };

    utterance.onerror = (event) => {
      console.error('[AudioBroadcast] Speech synthesis error:', event.error);
      resolve({
        success: false,
        message: `Broadcast failed: ${event.error}`,
        engine: 'web-speech-api',
      });
    };

    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stops any currently active voice broadcast.
 */
export function stopBroadcast(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}
