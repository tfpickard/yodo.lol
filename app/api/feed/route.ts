import { NextRequest, NextResponse } from 'next/server';
import { redditService } from '@/lib/reddit';
import { openaiService } from '@/lib/openai';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { EnhancedPost } from '@/lib/openai';

export const dynamic = 'force-dynamic';

/**
 * API Route: Get AI-enhanced Reddit feed
 * GET /api/feed
 *
 * Uses 2-minute cache to reduce Reddit + OpenAI API calls
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '15');

    // Check cache first (use limit in cache key for different request sizes)
    const cacheKey = `${CACHE_KEYS.FEED}_${limit}`;
    const cachedPosts = cache.get<EnhancedPost[]>(cacheKey, CACHE_TTL.FEED);

    if (cachedPosts && cachedPosts.length > 0) {
      console.log(`Returning cached feed (${cachedPosts.length} posts)`);
      return NextResponse.json({
        posts: cachedPosts,
        count: cachedPosts.length,
        timestamp: Date.now(),
        cached: true,
      });
    }

    // Fetch quirky Reddit posts if cache miss
    console.log(`Fetching new feed (cache miss) - limit: ${limit}`);
    const posts = await redditService.fetchQuirkyPosts(limit);

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No posts found', posts: [] },
        { status: 404 }
      );
    }

    // Enhance posts with AI-generated captions and personalities
    const enhancedPosts = await openaiService.enhancePostsWithAI(posts);

    // Cache the result
    cache.set(cacheKey, enhancedPosts);

    return NextResponse.json({
      posts: enhancedPosts,
      count: enhancedPosts.length,
      timestamp: Date.now(),
      cached: false,
    });
  } catch (error) {
    console.error('Error in feed API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
