import { redditService } from '@/lib/reddit';
import { openaiService } from '@/lib/openai';
import DynamicFeed from '@/components/DynamicFeed';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  try {
    // Fetch Reddit posts
    const posts = await redditService.fetchQuirkyPosts(15);

    // Enhance posts with AI
    const enhancedPosts = await openaiService.enhancePostsWithAI(posts);

    // Generate AI theme
    const theme = await openaiService.generateDesignTheme();

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
