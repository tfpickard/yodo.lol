import { NextResponse } from 'next/server';
import { openaiService } from '@/lib/openai';

export const dynamic = 'force-dynamic';

/**
 * API Route: Get AI-generated design theme
 * GET /api/theme
 */
export async function GET() {
  try {
    const theme = await openaiService.generateDesignTheme();

    return NextResponse.json({
      theme,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in theme API:', error);
    return NextResponse.json(
      { error: 'Failed to generate theme', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
