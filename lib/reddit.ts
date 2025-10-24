// Quirky, off-the-wall subreddits for unpredictable content
const QUIRKY_SUBREDDITS = [
  'hmmm',
  'interdimensionalcable',
  'WhatIsThisThing',
  'CrappyDesign',
  'ATBGE', // Awful Taste But Great Execution
  'blursedimages',
  'oddlysatisfying',
  'mildlyinteresting',
  'NotMyJob',
  'Pareidolia',
  'StockPhotos',
  'oddlyspecific',
  'BrandNewSentence',
  'me_irl',
  'surrealmemes',
  'cursedcomments',
  'BeAmazed',
  'Damnthatsinteresting',
  'DidntKnowIWantedThat',
  'blackmagicfuckery'
];

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  imageUrl?: string;
  thumbnail?: string;
  score: number;
  numComments: number;
  created: number;
  permalink: string;
  isVideo: boolean;
}

class RedditService {
  /**
   * Fetch trending posts from quirky subreddits using public Reddit JSON API
   * No authentication required!
   */
  async fetchQuirkyPosts(limit: number = 20): Promise<RedditPost[]> {
    const posts: RedditPost[] = [];
    const subredditCount = Math.min(5, QUIRKY_SUBREDDITS.length);
    const postsPerSubreddit = Math.ceil(limit / subredditCount);

    const selectedSubreddits = this.getRandomSubreddits(subredditCount);

    // Fetch from multiple subreddits in parallel for better performance
    const fetchPromises = selectedSubreddits.map(subredditName =>
      this.fetchFromSubreddit(subredditName, postsPerSubreddit)
    );

    const results = await Promise.allSettled(fetchPromises);

    // Collect successful results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        posts.push(...result.value);
      }
    }

    // Shuffle and limit results
    return posts
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  /**
   * Fetch posts from a specific subreddit
   */
  private async fetchFromSubreddit(
    subredditName: string,
    limit: number
  ): Promise<RedditPost[]> {
    try {
      // Use old.reddit.com to avoid 403 errors from Reddit's API restrictions
      const url = `https://old.reddit.com/r/${subredditName}/hot.json?limit=${limit * 2}`; // Fetch extra to account for filtering
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; YodoLol/1.0; +https://yodo.lol)',
        },
        next: { revalidate: 0 }, // Don't cache in Next.js
      });

      if (!response.ok) {
        console.warn(`Failed to fetch from r/${subredditName}: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const children = data?.data?.children || [];

      const posts: RedditPost[] = [];
      for (const child of children) {
        const post = child.data;
        const redditPost = this.transformPost(post);
        if (redditPost && redditPost.imageUrl) {
          posts.push(redditPost);
          if (posts.length >= limit) break;
        }
      }

      return posts;
    } catch (error) {
      console.error(`Error fetching from r/${subredditName}:`, error);
      return [];
    }
  }

  /**
   * Transform Reddit API post to our format
   */
  private transformPost(post: any): RedditPost | null {
    // Skip text posts, videos, and galleries
    if (post.is_self || post.is_video || post.is_gallery) return null;

    // Skip NSFW content
    if (post.over_18) return null;

    const imageUrl = this.extractImageUrl(post);
    if (!imageUrl) return null;

    return {
      id: post.id,
      title: post.title,
      author: post.author,
      subreddit: post.subreddit,
      url: post.url,
      imageUrl,
      thumbnail: post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default'
        ? post.thumbnail
        : undefined,
      score: post.score,
      numComments: post.num_comments,
      created: post.created_utc,
      permalink: `https://reddit.com${post.permalink}`,
      isVideo: post.is_video || false,
    };
  }

  /**
   * Extract image URL from post
   */
  private extractImageUrl(post: any): string | null {
    // Check if it's a direct image link
    if (post.url && this.isImageUrl(post.url)) {
      return post.url;
    }

    // Check preview images (most reliable for Reddit hosted images)
    if (post.preview?.images?.[0]?.source?.url) {
      return this.decodeHtmlEntities(post.preview.images[0].source.url);
    }

    // Check if it's an imgur link (very common on Reddit)
    if (post.url?.includes('imgur.com') && !post.url.includes('/a/') && !post.url.includes('/gallery/')) {
      if (!post.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return `${post.url}.jpg`;
      }
      return post.url;
    }

    // Check for i.redd.it links
    if (post.url?.includes('i.redd.it')) {
      return post.url;
    }

    return null;
  }

  /**
   * Check if URL is an image
   */
  private isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  /**
   * Decode HTML entities in URLs (Reddit returns &amp; instead of &)
   */
  private decodeHtmlEntities(url: string): string {
    return url
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  /**
   * Get random subreddits from the list
   */
  private getRandomSubreddits(count: number): string[] {
    const shuffled = [...QUIRKY_SUBREDDITS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get a random quirky subreddit
   */
  getRandomSubreddit(): string {
    return QUIRKY_SUBREDDITS[Math.floor(Math.random() * QUIRKY_SUBREDDITS.length)];
  }
}

export const redditService = new RedditService();
