import { z } from 'zod';

/**
 * Strict validation schema for weather parameters.
 * Used to validate both mock and real weather API responses.
 */
export const WeatherParametersSchema = z.object({
  rainfallMm: z.number().min(0).max(1000),
  windSpeedKmh: z.number().min(0).max(400),
  visibilityKm: z.number().min(0).max(100),
  floodRiskPercent: z.number().min(0).max(100),
});

export type ValidatedWeatherParameters = z.infer<typeof WeatherParametersSchema>;

/** Severity level union type (also validated via Zod for API responses). */
export const WeatherSeveritySchema = z.enum(['low', 'moderate', 'high', 'critical']);

/** Phase of weather event. */
export const WeatherPhaseSchema = z.enum(['before', 'during', 'after']);
