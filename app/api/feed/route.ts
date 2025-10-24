import { NextRequest, NextResponse } from 'next/server';
import { redditService } from '@/lib/reddit';
import { openaiService } from '@/lib/openai';

export const dynamic = 'force-dynamic';

/**
 * API Route: Get AI-enhanced Reddit feed
 * GET /api/feed
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '15');

    // Fetch quirky Reddit posts
    const posts = await redditService.fetchQuirkyPosts(limit);

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No posts found', posts: [] },
        { status: 404 }
      );
    }

    // Enhance posts with AI-generated captions and personalities
    const enhancedPosts = await openaiService.enhancePostsWithAI(posts);

    return NextResponse.json({
      posts: enhancedPosts,
      count: enhancedPosts.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in feed API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
