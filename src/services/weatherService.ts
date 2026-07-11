import { z } from 'zod';
import { WeatherParametersSchema } from '@/schemas/weather';
import { calculateSeverity, generateTravelAdvisory, type WeatherSeverity } from '@/utils/weather-engine';

export const WeatherSnapshotSchema = WeatherParametersSchema.extend({
  location: z.string().min(2),
  temperatureC: z.number().min(-50).max(60),
  severity: z.enum(['low', 'moderate', 'high', 'critical']),
  recommendation: z.string().min(1),
  source: z.string().min(1),
  updatedAt: z.string().datetime(),
});

export type WeatherSnapshot = z.infer<typeof WeatherSnapshotSchema>;

function locationScore(location: string): number {
  return Array.from(location.trim()).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/**
 * Provider-ready weather snapshot abstraction.
 *
 * The current implementation is deterministic mock data for challenge/demo
 * reliability. A real provider can replace this function without changing the
 * API route, GenAI prompt, or WeatherAdvisory component contracts.
 */
export async function getWeatherSnapshot(location: string): Promise<WeatherSnapshot> {
  const normalizedLocation = location.trim();
  const score = locationScore(normalizedLocation);

  const parameters = WeatherParametersSchema.parse({
    rainfallMm: 40 + (score % 90),
    windSpeedKmh: 24 + (score % 38),
    visibilityKm: Math.max(1, 8 - (score % 6)),
    floodRiskPercent: 18 + (score % 58),
  });

  const severity: WeatherSeverity = calculateSeverity(parameters);
  const advisory = generateTravelAdvisory(severity, 'before');

  return WeatherSnapshotSchema.parse({
    ...parameters,
    location: normalizedLocation,
    temperatureC: 24 + (score % 8),
    severity,
    recommendation: advisory.recommendation,
    source: 'mock-weather-engine',
    updatedAt: new Date().toISOString(),
  });
}
