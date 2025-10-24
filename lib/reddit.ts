// Quirky, off-the-wall subreddits for unpredictable content
const QUIRKY_SUBREDDITS = [
  // Original chaos
  "hmmm",
  "interdimensionalcable",
  "WhatIsThisThing",
  "CrappyDesign",
  "ATBGE", // Awful Taste But Great Execution
  "blursedimages",
  "oddlysatisfying",
  "mildlyinteresting",
  "NotMyJob",
  "Pareidolia",
  "oddlyspecific",
  "BrandNewSentence",
  "me_irl",
  "surrealmemes",
  "cursedcomments",
  // Expanded absurdity
  "BreadStapledToTrees", // Bread stapled to trees. Literally.
  "WeWantPlates", // Absurd plate presentation
  "AssholeDesign", // Malicious design
  "Justrolledintotheshop", // Automotive nightmares
  "TreesSuckingAtThings", // Trees failing at tree things
  "ShowerOrange", // People eating oranges in the shower
  "PhotoshopBattles", // Creative photoshop edits
  "ForbiddenSnacks", // Things that look edible but aren't
  "evilbuildings", // Buildings that look evil
  "BadUrbanPlanning", // Urban design fails
  "PointlesslyGendered", // Needlessly gendered products
  "JustBootThings", // Bootleg/corrupted versions
  "WTFStockPhotos", // Weird stock photos
  "TIHI", // Thanks I Hate It
  "agedlikemilk", // Things that aged badly
  "Bananaforscale", // Using bananas for scale
  "MildlyVandalised", // Mild vandalism
  "shittyfoodporn", // Terrible food photos
  "ImaginaryMonsters", // Weird imaginary creatures
  "CatsWithJobs",
  "ChairsUnderwater",
  "ToiletsWithThreateningAuras",
  "ThingsFittingInThings",
  "BeesBeingJerks",
  "StartledCats",
  "StuffOnCats",
  "CursedCommentsIRL",
  "PeopleFuckingDying",
  "PeopleWithBirds",
  "FlatsThatJustWork",
  "AccidentalPenis",
  "PerfectlyCutMemes",
  "HotdogWater",
  "AnimalsWithoutNecks",
  "AccidentalWesAnderson",
  "DelusionalArtists",
  "Zoomies",
  "ThingsCutInHalfPorn",
  "evilbuildings",
  "WhenThingsWereFresh",
  "HorsesStandingLikeDogs",
  "ItemShop",
  "UnusualVideos",
  "SadBeige",
  "bonehurtingjuice",
  "mildlyvagina",
  "Mirrorsforsale",
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

interface RedditOAuthToken {
  access_token: string;
  expires_at: number;
}

class RedditService {
  private accessToken: RedditOAuthToken | null = null;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    // Get Reddit API credentials from environment variables
    this.clientId = process.env.REDDIT_CLIENT_ID || "";
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || "";
  }

  /**
   * Get OAuth access token for Reddit API
   */
  private async getAccessToken(): Promise<string | null> {
    // Return cached token if still valid
    if (this.accessToken && this.accessToken.expires_at > Date.now()) {
      return this.accessToken.access_token;
    }

    // If no credentials, return null (will fall back to unauthenticated access)
    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "Reddit API credentials not configured. Using unauthenticated access (limited).",
      );
      return null;
    }

    try {
      // Get new token using OAuth client credentials flow
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString("base64");

      const response = await fetch(
        "https://www.reddit.com/api/v1/access_token",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "yodo.lol/1.0.0",
          },
          body: "grant_type=client_credentials",
        },
      );

      if (!response.ok) {
        console.error(`Failed to get Reddit OAuth token: ${response.status}`);
        return null;
      }

      const data = await response.json();

      // Cache token (expires in 1 hour, we'll refresh 5 minutes early)
      this.accessToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 300) * 1000,
      };

      return this.accessToken.access_token;
    } catch (error) {
      console.error("Error getting Reddit OAuth token:", error);
      return null;
    }
  }
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
    const fetchPromises = selectedSubreddits.map((subredditName) =>
      this.fetchFromSubreddit(subredditName, postsPerSubreddit),
    );

    const results = await Promise.allSettled(fetchPromises);

    // Collect successful results
    for (const result of results) {
      if (result.status === "fulfilled") {
        posts.push(...result.value);
      }
    }

    // Shuffle and limit results
    return posts.sort(() => Math.random() - 0.5).slice(0, limit);
  }

  /**
   * Fetch posts from a specific subreddit
   */
  private async fetchFromSubreddit(
    subredditName: string,
    limit: number,
  ): Promise<RedditPost[]> {
    try {
      const token = await this.getAccessToken();

      // Build headers
      const headers: HeadersInit = {
        "User-Agent": "yodo.lol/1.0.0",
      };

      // Use OAuth API if we have a token
      let baseUrl = "https://www.reddit.com";
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        baseUrl = "https://oauth.reddit.com";
      }

      const url = `${baseUrl}/r/${subredditName}/hot.json?limit=${limit * 2}&raw_json=1`;

      const response = await fetch(url, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        console.warn(
          `Failed to fetch from r/${subredditName}: ${response.status}`,
        );
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
      thumbnail:
        post.thumbnail &&
        post.thumbnail !== "self" &&
        post.thumbnail !== "default"
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
    if (
      post.url?.includes("imgur.com") &&
      !post.url.includes("/a/") &&
      !post.url.includes("/gallery/")
    ) {
      if (!post.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return `${post.url}.jpg`;
      }
      return post.url;
    }

    // Check for i.redd.it links
    if (post.url?.includes("i.redd.it")) {
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
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
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
    return QUIRKY_SUBREDDITS[
      Math.floor(Math.random() * QUIRKY_SUBREDDITS.length)
    ];
  }
}

export const redditService = new RedditService();
