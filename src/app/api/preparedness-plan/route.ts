import { NextRequest, NextResponse } from 'next/server';
import { PreparednessRequestSchema } from '@/schemas/preparedness';
import { checkRateLimit } from '@/utils/rate-limiter';
import { generatePreparednessPlan } from '@/services/gemini';

/**
 * POST /api/preparedness-plan
 * Secure endpoint that accepts user context and returns a GenAI-generated preparedness plan.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 } // 429 Too Many Requests
      );
    }

    // 2. Parse Request Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // 3. Strict Input Validation via Zod
    const parseResult = PreparednessRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    // 4. Process with GenAI Service
    const plan = await generatePreparednessPlan(parseResult.data);

    // 5. Return Structured Response
    return NextResponse.json(plan, { status: 200 });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
