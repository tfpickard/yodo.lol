import { redditService } from '@/lib/reddit';
import { openaiService, EnhancedPost, DesignTheme } from '@/lib/openai';
import DynamicFeed from '@/components/DynamicFeed';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Switch to ISR (Incremental Static Regeneration) for better performance
// Page will be regenerated every 2 minutes instead of on every request
export const revalidate = 120; // 2 minutes

export default async function Home() {
  try {
    // Check cache for posts and theme
    let enhancedPosts = cache.get<EnhancedPost[]>(CACHE_KEYS.FEED + '_15', CACHE_TTL.FEED);
    let theme = cache.get<DesignTheme>(CACHE_KEYS.THEME, CACHE_TTL.THEME);

    // Fetch Reddit posts if not in cache
    if (!enhancedPosts) {
      console.log('Fetching fresh posts for page load');
      const posts = await redditService.fetchQuirkyPosts(15);
      enhancedPosts = await openaiService.enhancePostsWithAI(posts);
      cache.set(CACHE_KEYS.FEED + '_15', enhancedPosts);
    }

    // Generate AI theme if not in cache
    if (!theme) {
      console.log('Generating fresh theme for page load');
      theme = await openaiService.generateDesignTheme();
      cache.set(CACHE_KEYS.THEME, theme);
    }

    return (
      <DynamicFeed
        initialPosts={enhancedPosts}
        initialTheme={theme}
      />
    );
  } catch (error) {
    console.error('Error loading page:', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">YODO.LOL</h1>
          <p className="text-xl mb-4">Oops! Something went wrong.</p>
          <p className="opacity-75 mb-6">
            {error instanceof Error ? error.message : 'Failed to load the feed'}
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-block"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }
}
