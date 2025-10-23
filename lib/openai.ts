import OpenAI from 'openai';
import { RedditPost } from './reddit';

export interface DesignTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  layoutStyle: 'grid' | 'masonry' | 'list' | 'cards';
  mood: string;
  animation: string;
}

export interface EnhancedPost extends RedditPost {
  aiCaption?: string;
  aiPersonality?: string;
  mood?: string;
}

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a random design theme using GPT
   */
  async generateDesignTheme(): Promise<DesignTheme> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a creative web designer with a quirky, experimental style. Generate unique, sometimes wild design themes that push boundaries. Mix unexpected color combinations, unique fonts, and creative layouts. Make each theme feel completely different from typical web design.`,
          },
          {
            role: 'user',
            content: `Generate a completely unique, creative design theme for a social media feed. Be bold and experimental! Return ONLY a JSON object with this structure:
{
  "primaryColor": "hex color",
  "secondaryColor": "hex color",
  "accentColor": "hex color",
  "backgroundColor": "hex color",
  "textColor": "hex color",
  "fontFamily": "font name from Google Fonts or web-safe fonts",
  "borderRadius": "value like '0px', '8px', '20px', '50%'",
  "layoutStyle": "grid, masonry, list, or cards",
  "mood": "describe the mood in 2-3 words",
  "animation": "subtle, bouncy, glitchy, smooth, or chaotic"
}

Make it weird, make it fun, make it memorable!`,
          },
        ],
        temperature: 1.2,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const theme = JSON.parse(content) as DesignTheme;
      return theme;
    } catch (error) {
      console.error('Error generating design theme:', error);
      return this.getDefaultTheme();
    }
  }

  /**
   * Generate quirky captions for multiple posts in one call (more efficient)
   */
  async enhancePostsWithAI(posts: RedditPost[]): Promise<EnhancedPost[]> {
    if (posts.length === 0) return [];

    try {
      const postSummaries = posts.map((post, idx) =>
        `${idx + 1}. From r/${post.subreddit}: "${post.title}"`
      ).join('\n');

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a hilariously quirky social media personality with multiple personalities. You interpret Reddit posts in unexpected, creative, and sometimes absurd ways. Each post should feel like it's being narrated by a different character - one might be overly dramatic, another might be a conspiracy theorist, another might be extremely wholesome, etc. Be unpredictable and entertaining!`,
          },
          {
            role: 'user',
            content: `For each of these Reddit posts, generate a unique caption and describe the personality narrating it. Make each one completely different in tone and style.

Posts:
${postSummaries}

Return ONLY a JSON object with this structure:
{
  "posts": [
    {
      "index": 1,
      "caption": "the quirky AI-generated caption",
      "personality": "brief description of who's narrating (e.g., 'overly excited conspiracy theorist', 'zen meditation guru', 'dramatic theater kid')",
      "mood": "one word mood"
    },
    ...
  ]
}

Make each caption wildly different from the others!`,
          },
        ],
        temperature: 1.3,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const result = JSON.parse(content);
      const aiPosts = result.posts || [];

      return posts.map((post, idx) => {
        const aiData = aiPosts.find((p: any) => p.index === idx + 1) || {};
        return {
          ...post,
          aiCaption: aiData.caption || this.getDefaultCaption(),
          aiPersonality: aiData.personality || 'mysterious stranger',
          mood: aiData.mood || 'curious',
        };
      });
    } catch (error) {
      console.error('Error enhancing posts:', error);
      return posts.map(post => ({
        ...post,
        aiCaption: this.getDefaultCaption(),
        aiPersonality: 'confused AI',
        mood: 'uncertain',
      }));
    }
  }

  /**
   * Get a default theme as fallback
   */
  private getDefaultTheme(): DesignTheme {
    const themes: DesignTheme[] = [
      {
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        accentColor: '#FFE66D',
        backgroundColor: '#1A1A2E',
        textColor: '#EAEAEA',
        fontFamily: 'Inter',
        borderRadius: '12px',
        layoutStyle: 'masonry',
        mood: 'vibrant chaos',
        animation: 'bouncy',
      },
      {
        primaryColor: '#A8DADC',
        secondaryColor: '#457B9D',
        accentColor: '#F1FAEE',
        backgroundColor: '#1D3557',
        textColor: '#F1FAEE',
        fontFamily: 'Space Mono',
        borderRadius: '4px',
        layoutStyle: 'grid',
        mood: 'retro digital',
        animation: 'glitchy',
      },
      {
        primaryColor: '#06FFA5',
        secondaryColor: '#FF006E',
        accentColor: '#FFBE0B',
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        fontFamily: 'Courier New',
        borderRadius: '0px',
        layoutStyle: 'list',
        mood: 'cyberpunk',
        animation: 'glitchy',
      },
    ];

    return themes[Math.floor(Math.random() * themes.length)];
  }

  /**
   * Get a default caption as fallback
   */
  private getDefaultCaption(): string {
    const captions = [
      "This image speaks to my soul in ways I can't explain... 🤔",
      "POV: You've scrolled too far into the weird part of the internet",
      "I have no idea what's happening here but I'm here for it",
      "This is giving me emotions I didn't know existed",
      "The universe really said 'let's confuse everyone today'",
    ];
    return captions[Math.floor(Math.random() * captions.length)];
  }
}

export const openaiService = new OpenAIService();
