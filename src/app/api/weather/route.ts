import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { WeatherParametersSchema } from '@/schemas/weather';
import { calculateSeverity, generateTravelAdvisory } from '@/utils/weather-engine';

const WeatherQuerySchema = z.object({
  location: z.string().min(2).max(100).default('Mumbai, Maharashtra'),
});

const WeatherResponseSchema = WeatherParametersSchema.extend({
  location: z.string(),
  temperatureC: z.number().min(-50).max(60),
  severity: z.enum(['low', 'moderate', 'high', 'critical']),
  recommendation: z.string().min(1),
  source: z.literal('mock-weather-engine'),
  updatedAt: z.string(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = WeatherQuerySchema.safeParse({
    location: req.nextUrl.searchParams.get('location') ?? undefined,
  });

  if (!query.success) {
    return NextResponse.json({ error: 'Invalid weather query.' }, { status: 400 });
  }

  const normalizedLocation = query.data.location.trim();
  const locationScore = Array.from(normalizedLocation).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const parameters = WeatherParametersSchema.parse({
    rainfallMm: 40 + (locationScore % 90),
    windSpeedKmh: 24 + (locationScore % 38),
    visibilityKm: Math.max(1, 8 - (locationScore % 6)),
    floodRiskPercent: 18 + (locationScore % 58),
  });

  const severity = calculateSeverity(parameters);
  const advisory = generateTravelAdvisory(severity, 'before');

  const response = WeatherResponseSchema.parse({
    ...parameters,
    location: normalizedLocation,
    temperatureC: 24 + (locationScore % 8),
    severity,
    recommendation: advisory.recommendation,
    source: 'mock-weather-engine',
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json(response, { status: 200 });
}
