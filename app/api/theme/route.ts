import { NextResponse } from 'next/server';
import { openaiService } from '@/lib/openai';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { DesignTheme } from '@/lib/openai';

export const dynamic = 'force-dynamic';

/**
 * API Route: Get AI-generated design theme
 * GET /api/theme
 *
 * Uses 5-minute cache to reduce OpenAI API calls
 */
export async function GET() {
  try {
    // Check cache first
    const cachedTheme = cache.get<DesignTheme>(CACHE_KEYS.THEME, CACHE_TTL.THEME);

    if (cachedTheme) {
      console.log('Returning cached theme');
      return NextResponse.json({
        theme: cachedTheme,
        timestamp: Date.now(),
        cached: true,
      });
    }

    // Generate new theme if cache miss
    console.log('Generating new theme (cache miss)');
    const theme = await openaiService.generateDesignTheme();

    // Cache the result
    cache.set(CACHE_KEYS.THEME, theme);

    return NextResponse.json({
      theme,
      timestamp: Date.now(),
      cached: false,
    });
  } catch (error) {
    console.error('Error in theme API:', error);
    return NextResponse.json(
      { error: 'Failed to generate theme', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
