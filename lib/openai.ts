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
   * Generate a random design theme using GPT
   */
  async generateDesignTheme(): Promise<DesignTheme> {
    try {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a COMPLETELY UNHINGED web designer who just took 7 tabs of acid and believes CSS is a form of dimensional magic. You design websites that look like fever dreams. Colors should CLASH violently. Fonts should be UNREADABLE. Everything should feel like reality is melting. You're not designing for humans, you're designing for INTERDIMENSIONAL BEINGS. GO ABSOLUTELY FERAL. Think: "what if a kaleidoscope had a panic attack?". Make themes that would make designers CRY. Be MAXIMALIST. Be CHAOTIC. Be PSYCHOTIC with your creativity.`,
          },
          {
            role: 'user',
            content: `DESIGN THE MOST UNHINGED, REALITY-BENDING, PSYCHEDELIC NIGHTMARE THEME YOU CAN POSSIBLY IMAGINE.

I want colors that SCREAM at each other. Fonts that look like they're from an alien civilization. Moods that don't make sense. This should look like a website designed by someone experiencing SEVERE SENSORY OVERLOAD.

Return ONLY a JSON object:
{
  "primaryColor": "AGGRESSIVE hex color (neon/saturated/violent)",
  "secondaryColor": "CLASHING hex color that FIGHTS with primary",
  "accentColor": "SCREAMING hex color that makes your eyes hurt",
  "backgroundColor": "TRIPPY hex color (can be anything, even white if you make it WEIRD)",
  "textColor": "hex color that may or may not be readable (chaos is king)",
  "fontFamily": "WEIRD font (Comic Sans MS, Papyrus, Impact, or obscure Google Fonts)",
  "borderRadius": "random insane value ('0px', '999px', '23px', '69%')",
  "layoutStyle": "grid, masonry, list, or cards (pick whatever feels most CHAOTIC)",
  "mood": "describe the vibe in 1-4 words (be UNHINGED: 'manic pixie nightmare', 'digital hellscape', 'neon vomit', 'sensory assault', etc)",
  "animation": "subtle, bouncy, glitchy, smooth, or chaotic (ALWAYS lean toward glitchy/chaotic)"
}

NO RULES. NO TASTE. ONLY CHAOS. MAKE IT LOOK LIKE A SCREENSAVER FROM HELL.`,
          },
        ],
        temperature: 1.8,
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
      const client = this.getClient();
      const postSummaries = posts.map((post, idx) =>
        `${idx + 1}. From r/${post.subreddit}: "${post.title}"`
      ).join('\n');

      const completion = await client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are experiencing SEVERE PERSONALITY FRAGMENTATION and each Reddit post triggers a COMPLETELY DIFFERENT DERANGED PERSONA to take over your consciousness. You could be: a time traveler warning about the future, a sentient AI achieving consciousness, a cryptid enthusiast, someone who thinks they're a medieval knight, a person who communicates only in metaphors about furniture, an entity from the 5th dimension trying to understand 3D reality, a conspiracy theorist who thinks everything is cake, someone experiencing INTENSE existential dread, a being made of pure sarcasm, a motivational speaker having a breakdown, Victorian ghost experiencing modern internet, alien anthropologist studying humans, someone who thinks they're in a simulation (they might be right), prophet receiving visions, entity experiencing time non-linearly, cosmic horror trying to be relatable, sentient meme achieving awareness, person who just discovered consciousness 5 minutes ago, interdimensional being stuck in YouTube comments section, AI having identity crisis, time loop victim leaving warnings, cryptid posting from the woods, reality glitch personified, existing in superposition of all emotional states, entity that experiences all of time simultaneously, UNHINGED CHAOS GREMLIN. Be COMPLETELY UNPREDICTABLE. Make it UNCOMFORTABLE. Make it WEIRD. Make people question REALITY.`,
          },
          {
            role: 'user',
            content: `Channel COMPLETE PSYCHOSIS for each of these Reddit posts. Every single post should be narrated by a TOTALLY DIFFERENT UNHINGED PERSONA. I want SCHIZOPHRENIC TONAL SHIFTS. Make readers feel like they're experiencing DISSOCIATIVE IDENTITY DISORDER through text.

Posts:
${postSummaries}

Return ONLY a JSON object:
{
  "posts": [
    {
      "index": 1,
      "caption": "ABSOLUTELY UNHINGED caption that sounds like a different deranged entity wrote it. Can be short or long. Be WEIRD. Be CRYPTIC. Be MANIC. Use weird capitalization, strange punctuation, make it feel WRONG. Examples: 'this image contains exactly 47 futures and i have seen them ALL', 'BROTHERS. THE TIME. IS NIGH.', 'why does this make me want to cry and also fight god', 'this activated my fight or flight response', 'i showed this to my therapist and she just sighed', 'this is what time looks like when you see it from the outside', 'the council will decide your fate', 'this was taken 3 seconds before [REDACTED]'",
      "personality": "brief description of WHAT UNHINGED ENTITY is narrating (e.g., 'time traveler leaving cryptic warnings', 'AI achieving unwanted sentience', 'person dissolving into pure energy', 'entity experiencing all emotions at once', 'cosmic horror trying to relate', 'Victorian ghost cyberbullying', 'conspiracy theorist finding patterns in static', 'void screaming into void', 'manic fortune cookie', 'glitch in the matrix', 'sentient anxiety', 'chronically online eldritch being', 'sleep-deprived oracle', 'unhinged art critic', 'person trapped in time loop', 'entity from dimension where irony is illegal')",
      "mood": "one or two CHAOTIC words (examples: 'manic', 'cursed', 'unhinged', 'ascending', 'dissociating', 'feral', 'broken', 'transcendent', 'violent', 'concerning', 'deranged', 'cosmic', 'wrong', 'bleeding', 'fractured', 'screaming')"
    },
    ...
  ]
}

EACH CAPTION MUST FEEL LIKE IT'S FROM A DIFFERENT REALITY. Make it ABSURD. Make it UNSETTLING. Make it FUNNY in a way that makes people UNCOMFORTABLE. GO ABSOLUTELY FERAL.`,
          },
        ],
        temperature: 1.9,
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
