import Snoowrap from 'snoowrap';

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
  private client: Snoowrap | null = null;

  constructor() {
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      this.client = new Snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT || 'YodoLol:v1.0.0',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
      });
    }
  }

  /**
   * Fetch trending posts from quirky subreddits
   */
  async fetchQuirkyPosts(limit: number = 20): Promise<RedditPost[]> {
    if (this.client) {
      return this.fetchWithAuth(limit);
    } else {
      return this.fetchWithoutAuth(limit);
    }
  }

  /**
   * Fetch posts using authenticated Reddit API
   */
  private async fetchWithAuth(limit: number): Promise<RedditPost[]> {
    if (!this.client) return [];

    const posts: RedditPost[] = [];
    const subredditCount = Math.min(5, QUIRKY_SUBREDDITS.length);
    const postsPerSubreddit = Math.ceil(limit / subredditCount);

    // Randomly select subreddits for variety
    const selectedSubreddits = this.getRandomSubreddits(subredditCount);

    for (const subredditName of selectedSubreddits) {
      try {
        const subreddit = this.client.getSubreddit(subredditName);
        const listing = await subreddit.getHot({ limit: postsPerSubreddit });

        for (const post of listing) {
          const redditPost = this.transformPost(post);
          if (redditPost && redditPost.imageUrl) {
            posts.push(redditPost);
          }
        }
      } catch (error) {
        console.error(`Error fetching from r/${subredditName}:`, error);
      }
    }

    return posts.slice(0, limit);
  }

  /**
   * Fetch posts using public Reddit JSON API (no auth required)
   */
  private async fetchWithoutAuth(limit: number): Promise<RedditPost[]> {
    const posts: RedditPost[] = [];
    const subredditCount = Math.min(5, QUIRKY_SUBREDDITS.length);
    const postsPerSubreddit = Math.ceil(limit / subredditCount);

    const selectedSubreddits = this.getRandomSubreddits(subredditCount);

    for (const subredditName of selectedSubreddits) {
      try {
        const url = `https://www.reddit.com/r/${subredditName}/hot.json?limit=${postsPerSubreddit}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'YodoLol:v1.0.0',
          },
        });

        if (!response.ok) continue;

        const data = await response.json();
        const children = data?.data?.children || [];

        for (const child of children) {
          const post = child.data;
          const redditPost = this.transformPublicPost(post);
          if (redditPost && redditPost.imageUrl) {
            posts.push(redditPost);
          }
        }
      } catch (error) {
        console.error(`Error fetching from r/${subredditName}:`, error);
      }
    }

    return posts.slice(0, limit);
  }

  /**
   * Transform Snoowrap post object
   */
  private transformPost(post: any): RedditPost | null {
    if (post.is_self || post.is_video) return null;

    let imageUrl = this.extractImageUrl(post);
    if (!imageUrl) return null;

    return {
      id: post.id,
      title: post.title,
      author: post.author.name,
      subreddit: post.subreddit.display_name,
      url: post.url,
      imageUrl,
      thumbnail: post.thumbnail !== 'self' ? post.thumbnail : undefined,
      score: post.score,
      numComments: post.num_comments,
      created: post.created_utc,
      permalink: `https://reddit.com${post.permalink}`,
      isVideo: post.is_video || false,
    };
  }

  /**
   * Transform public Reddit API post
   */
  private transformPublicPost(post: any): RedditPost | null {
    if (post.is_self || post.is_video) return null;

    let imageUrl = this.extractImageUrl(post);
    if (!imageUrl) return null;

    return {
      id: post.id,
      title: post.title,
      author: post.author,
      subreddit: post.subreddit,
      url: post.url,
      imageUrl,
      thumbnail: post.thumbnail !== 'self' ? post.thumbnail : undefined,
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

    // Check preview images
    if (post.preview?.images?.[0]?.source?.url) {
      return post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    // Check if it's an imgur link
    if (post.url?.includes('imgur.com') && !post.url.includes('/a/')) {
      if (!post.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return `${post.url}.jpg`;
      }
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
