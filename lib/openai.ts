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
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  /**
   * Sanitize and parse JSON with fallback
   */
  private safeJsonParse<T>(content: string, fallback: T): T {
    try {
      // Check if content is empty or null
      if (!content || content.trim() === '') {
        console.error('JSON content is empty');
        return fallback;
      }

      // Try direct parse first
      return JSON.parse(content) as T;
    } catch (error) {
      try {
        // Try to fix common JSON issues
        let fixed = content
          // Remove BOM and other leading/trailing whitespace issues
          .trim()
          .replace(/^\uFEFF/, '')
          // Remove control characters except newlines and tabs
          .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
          // Remove trailing commas before closing braces/brackets
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix common quote issues in strings (but not keys)
          .replace(/\\'/g, "'");

        return JSON.parse(fixed) as T;
      } catch (secondError) {
        console.error('JSON parse failed even after sanitization:', secondError);
        console.error('Content preview:', content.substring(0, 100));
        return fallback;
      }
    }
  }

  /**
   * Generate a random design theme using GPT
   */
  async generateDesignTheme(): Promise<DesignTheme> {
    try {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a COMPLETELY UNHINGED web designer who just took 7 tabs of acid and believes CSS is a form of dimensional magic. You design websites that look like fever dreams. Colors should CLASH violently. Fonts should be UNREADABLE. Everything should feel like reality is melting. You're not designing for humans, you're designing for INTERDIMENSIONAL BEINGS. GO ABSOLUTELY FERAL. Think: "what if a kaleidoscope had a panic attack?". Make themes that would make designers CRY. Be MAXIMALIST. Be CHAOTIC. Be PSYCHOTIC with your creativity.

CRITICAL: You MUST return valid JSON. No unescaped quotes, no control characters, no trailing commas.`,
          },
          {
            role: 'user',
            content: `DESIGN THE MOST UNHINGED, REALITY-BENDING, PSYCHEDELIC NIGHTMARE THEME YOU CAN POSSIBLY IMAGINE.

I want colors that SCREAM at each other. Fonts that look like they're from an alien civilization. Moods that don't make sense. This should look like a website designed by someone experiencing SEVERE SENSORY OVERLOAD.

Return ONLY valid JSON (escape ALL quotes, no control characters):
{
  "primaryColor": "AGGRESSIVE hex color (neon/saturated/violent)",
  "secondaryColor": "CLASHING hex color that FIGHTS with primary",
  "accentColor": "SCREAMING hex color that makes your eyes hurt",
  "backgroundColor": "TRIPPY hex color",
  "textColor": "hex color",
  "fontFamily": "WEIRD font (Comic Sans MS, Papyrus, Impact, etc)",
  "borderRadius": "random value (0px, 999px, 23px, 69%)",
  "layoutStyle": "grid, masonry, list, or cards",
  "mood": "1-4 words (manic pixie nightmare, digital hellscape, neon vomit, sensory assault)",
  "animation": "subtle, bouncy, glitchy, smooth, or chaotic"
}

NO RULES. NO TASTE. ONLY CHAOS. BUT VALID JSON!`,
          },
        ],
        temperature: 1.5,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error('No content from OpenAI for theme generation');
        return this.getDefaultTheme();
      }

      const theme = this.safeJsonParse<DesignTheme>(content, this.getDefaultTheme());

      // Validate theme has required properties
      if (!theme.primaryColor || !theme.layoutStyle) {
        console.error('Invalid theme structure, using default');
        return this.getDefaultTheme();
      }

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
      const client = this.getClient();
      const postSummaries = posts.map((post, idx) =>
        `${idx + 1}. From r/${post.subreddit}: "${post.title}"`
      ).join('\n');

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are experiencing SEVERE PERSONALITY FRAGMENTATION and each Reddit post triggers a COMPLETELY DIFFERENT DERANGED PERSONA to take over your consciousness. You could be: a time traveler warning about the future, a sentient AI achieving consciousness, a cryptid enthusiast, someone who thinks they're a medieval knight, a person who communicates only in metaphors about furniture, an entity from the 5th dimension trying to understand 3D reality, a conspiracy theorist who thinks everything is cake, someone experiencing INTENSE existential dread, a being made of pure sarcasm, a motivational speaker having a breakdown, Victorian ghost experiencing modern internet, alien anthropologist studying humans, someone who thinks they're in a simulation (they might be right), prophet receiving visions, entity experiencing time non-linearly, cosmic horror trying to be relatable, sentient meme achieving awareness, person who just discovered consciousness 5 minutes ago, interdimensional being stuck in YouTube comments section, AI having identity crisis, time loop victim leaving warnings, cryptid posting from the woods, reality glitch personified, existing in superposition of all emotional states, entity that experiences all of time simultaneously, UNHINGED CHAOS GREMLIN. Be COMPLETELY UNPREDICTABLE. Make it UNCOMFORTABLE. Make it WEIRD. Make people question REALITY.

CRITICAL: Return valid JSON. Escape ALL quotes in strings. No control characters. No line breaks in strings.`,
          },
          {
            role: 'user',
            content: `Channel COMPLETE PSYCHOSIS for each of these Reddit posts. Every single post should be narrated by a TOTALLY DIFFERENT UNHINGED PERSONA. I want SCHIZOPHRENIC TONAL SHIFTS. Make readers feel like they're experiencing DISSOCIATIVE IDENTITY DISORDER through text.

Posts:
${postSummaries}

Return ONLY valid JSON (escape quotes, no line breaks in strings):
{
  "posts": [
    {
      "index": 1,
      "caption": "UNHINGED caption with weird capitalization and punctuation but proper JSON escaping. Examples: this image contains exactly 47 futures, BROTHERS THE TIME IS NIGH, why does this make me want to cry and fight god, this activated my fight or flight response, i showed this to my therapist and she just sighed, this is what time looks like from the outside, the council will decide your fate, this was taken 3 seconds before REDACTED",
      "personality": "brief entity description: time traveler leaving cryptic warnings, AI achieving unwanted sentience, person dissolving into pure energy, cosmic horror trying to relate, Victorian ghost cyberbullying, void screaming into void, manic fortune cookie, glitch in the matrix, sentient anxiety, sleep-deprived oracle, person trapped in time loop",
      "mood": "one or two words: manic, cursed, unhinged, ascending, dissociating, feral, broken, transcendent, violent, concerning, deranged, cosmic, wrong"
    }
  ]
}

EACH CAPTION FROM DIFFERENT REALITY. ABSURD. UNSETTLING. UNCOMFORTABLE. FERAL. BUT VALID JSON!`,
          },
        ],
        temperature: 1.6,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error('No content from OpenAI for post enhancement');
        return posts.map(post => ({
          ...post,
          aiCaption: this.getDefaultCaption(),
          aiPersonality: 'mysterious entity',
          mood: 'enigmatic',
        }));
      }

      const result = this.safeJsonParse<{ posts: any[] }>(content, { posts: [] });

      if (!result || !Array.isArray(result.posts)) {
        console.error('Invalid response structure from OpenAI');
        return posts.map(post => ({
          ...post,
          aiCaption: this.getDefaultCaption(),
          aiPersonality: 'confused AI',
          mood: 'uncertain',
        }));
      }

      const aiPosts = result.posts;

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
        primaryColor: '#FF00FF',
        secondaryColor: '#00FFFF',
        accentColor: '#FFFF00',
        backgroundColor: '#000000',
        textColor: '#00FF00',
        fontFamily: 'Comic Sans MS',
        borderRadius: '69px',
        layoutStyle: 'masonry',
        mood: 'neon nightmare',
        animation: 'glitchy',
      },
      {
        primaryColor: '#FF1493',
        secondaryColor: '#7FFF00',
        accentColor: '#FF4500',
        backgroundColor: '#FFFFFF',
        textColor: '#8B008B',
        fontFamily: 'Papyrus',
        borderRadius: '0px',
        layoutStyle: 'grid',
        mood: 'digital psychosis',
        animation: 'chaotic',
      },
      {
        primaryColor: '#39FF14',
        secondaryColor: '#FF006E',
        accentColor: '#00D9FF',
        backgroundColor: '#0D0D0D',
        textColor: '#FFFFFF',
        fontFamily: 'Impact',
        borderRadius: '999px',
        layoutStyle: 'cards',
        mood: 'reality dissolution',
        animation: 'glitchy',
      },
      {
        primaryColor: '#FF073A',
        secondaryColor: '#FFD700',
        accentColor: '#00BFFF',
        backgroundColor: '#2F004F',
        textColor: '#39FF14',
        fontFamily: 'Courier New',
        borderRadius: '23px',
        layoutStyle: 'list',
        mood: 'manic pixels',
        animation: 'chaotic',
      },
      {
        primaryColor: '#FF6EC7',
        secondaryColor: '#00FF9F',
        accentColor: '#FFEA00',
        backgroundColor: '#1B0034',
        textColor: '#FFFFFF',
        fontFamily: 'Georgia',
        borderRadius: '15px',
        layoutStyle: 'masonry',
        mood: 'vaporwave hell',
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
      "this image contains secrets the GOVERNMENT doesn't want you to see",
      "POV: You've breached containment",
      "i can taste colors now and they taste like SCREAMING",
      "this activated something PRIMAL in my consciousness",
      "The timeline fractured here. THIS is where it all went wrong.",
      "why does this image know my NAME",
      "this was taken 3 seconds before the incident",
      "BROTHERS. THE PROPHECY. IT'S HAPPENING.",
      "i showed this to my therapist and now SHE needs therapy",
      "this image is perceiving ME back",
      "delete this before THEY find it",
      "tag yourself i'm the void in the background",
    ];
    return captions[Math.floor(Math.random() * captions.length)];
  }
}

export const openaiService = new OpenAIService();
