import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getWeatherSnapshot } from '@/services/weatherService';

const WeatherQuerySchema = z.object({
  location: z.string().min(2).max(100).default('Mumbai, Maharashtra'),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = WeatherQuerySchema.safeParse({
    location: req.nextUrl.searchParams.get('location') ?? undefined,
  });

  if (!query.success) {
    return NextResponse.json({ error: 'Invalid weather query.' }, { status: 400 });
  }

  const normalizedLocation = query.data.location.trim();
  const snapshot = await getWeatherSnapshot(normalizedLocation);

  return NextResponse.json(snapshot, { status: 200 });
}
