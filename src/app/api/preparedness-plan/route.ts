import { NextRequest, NextResponse } from 'next/server';
import { PreparednessRequestSchema } from '@/schemas/preparedness';
import { checkRateLimit } from '@/utils/rate-limiter';
import { generatePreparednessPlan } from '@/services/aiPlanService';

/** Standard error response shape for consistent client-side handling. */
interface ApiErrorResponse {
  readonly error: string;
  readonly details?: ReadonlyArray<{ path: ReadonlyArray<string | number>; message: string }>;
}

/**
 * POST /api/preparedness-plan
 *
 * Secure endpoint that accepts user context and returns a GenAI-generated
 * phased monsoon preparedness plan. Protected by rate limiting and strict
 * Zod validation on both input and GenAI output.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Rate Limiting
    if (!checkRateLimit(req)) {
      const error: ApiErrorResponse = { error: 'Too many requests. Please try again later.' };
      return NextResponse.json(error, { status: 429 });
    }

    // 2. Parse Request Body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const error: ApiErrorResponse = { error: 'Invalid JSON body.' };
      return NextResponse.json(error, { status: 400 });
    }

    // 3. Strict Input Validation
    const parseResult = PreparednessRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const error: ApiErrorResponse = {
        error: 'Validation Error',
        details: parseResult.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      };
      return NextResponse.json(error, { status: 400 });
    }

    // 4. Generate plan (inputs are sanitized inside the service)
    const plan = await generatePreparednessPlan(parseResult.data);

    // 5. Return validated, structured response
    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    console.error('API Route Error:', error);
    const apiError: ApiErrorResponse = { error: 'Internal Server Error' };
    return NextResponse.json(apiError, { status: 500 });
  }
}
