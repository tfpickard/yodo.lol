# YODO.LOL 🎨✨

**AI-Powered Chaotic Reddit Feed with Ever-Changing Design**

A dynamic web application that combines the unpredictable content of Reddit with AI-generated personalities and ever-morphing visual styles. Each visit creates a completely unique experience!

## 🌟 Features

- **AI-Generated Design Themes**: GPT-4 creates unique color schemes, fonts, layouts, and animations that change automatically
- **Quirky Reddit Content**: Pulls from off-the-wall subreddits like r/hmmm, r/interdimensionalcable, r/blursedimages, and more
- **AI Personalities**: Each post gets a unique AI-generated caption and personality (conspiracy theorist, zen guru, dramatic theater kid, etc.)
- **Dynamic Layouts**: Automatic switching between grid, masonry, list, and card layouts
- **Auto-Morphing**: The entire page design transforms every 30 seconds
- **Smooth Animations**: Custom animations (bouncy, glitchy, smooth, chaotic) based on the current theme
- **Instagram-Like Feed**: Familiar social media interface with a psychedelic twist

## 🎭 The Experience

Every visit to YODO.LOL is unique:
- Random Reddit posts from quirky subreddits
- AI interprets each post with a different personality
- Colors, fonts, and layouts morph continuously
- Never the same experience twice!

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (required)
- Reddit API credentials (required for production/Vercel)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd yodo.lol
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   # Required: OpenAI API Key
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # Required for Production: Reddit API Credentials
   REDDIT_CLIENT_ID=your-client-id
   REDDIT_CLIENT_SECRET=your-client-secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Getting API Keys

### OpenAI API Key (Required)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy it to your `.env` file

**Note**: This app uses GPT-4-turbo which requires a paid OpenAI account with credits.

### Reddit API (Required for Production)

Due to Reddit blocking unauthenticated requests from cloud infrastructure (like Vercel), you'll need to set up Reddit API credentials:

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose **"script"** as the app type
4. Fill in:
   - **name**: yodo-lol (or any name)
   - **description**: AI-powered Reddit feed
   - **redirect uri**: http://localhost (not used but required)
5. Click "Create app"
6. Copy the **client ID** (under the app name)
7. Copy the **secret**
8. Add both to your `.env` file

**Why OAuth?**
- Reddit blocks unauthenticated requests from cloud providers
- OAuth provides reliable, authenticated access
- The app uses the "client credentials" flow (no user login needed)
- Rate limits are more generous with authentication

## 🎨 How It Works

### 1. Reddit Content Fetching (`lib/reddit.ts`)
- Uses Reddit's OAuth API with client credentials flow
- Automatically handles token management and caching
- Randomly selects 5 quirky subreddits
- Fetches hot posts with images in parallel
- Filters out NSFW content, videos, and text posts

### 2. AI Enhancement (`lib/openai.ts`)
- Sends post titles to GPT-4
- Generates unique captions with different personalities
- Creates random design themes with colors, fonts, layouts

### 3. Dynamic Theme Engine (`lib/theme-engine.ts`)
- Applies CSS custom properties dynamically
- Loads Google Fonts on the fly
- Enables smooth transitions between themes

### 4. Feed Components (`components/`)
- **DynamicFeed**: Main orchestrator, handles theme changes and refreshes
- **Feed**: Renders posts in different layouts
- **FeedPost**: Individual post component with animations

## 🎮 Controls

- **🎲 Chaos Mode**: Refreshes both content AND theme
- **📱 New Posts**: Fetches new Reddit posts
- **🎨 New Theme**: Generates a new AI design theme
- **Auto-Morph**: Theme automatically changes every 30 seconds

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Custom Properties
- **AI**: OpenAI GPT-4-turbo
- **Reddit API**: Public JSON API (no auth required)
- **Animations**: Framer Motion
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
yodo.lol/
├── app/
│   ├── api/
│   │   ├── feed/route.ts      # API endpoint for Reddit posts
│   │   └── theme/route.ts     # API endpoint for AI themes
│   ├── globals.css            # Global styles and animations
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page (server component)
├── components/
│   ├── DynamicFeed.tsx        # Main feed orchestrator
│   ├── Feed.tsx               # Feed layout component
│   └── FeedPost.tsx           # Individual post component
├── lib/
│   ├── openai.ts              # OpenAI service
│   ├── reddit.ts              # Reddit service
│   └── theme-engine.ts        # Dynamic theme engine
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

## 🎯 Customization

### Add More Subreddits

Edit `lib/reddit.ts` and add to the `QUIRKY_SUBREDDITS` array:

```typescript
const QUIRKY_SUBREDDITS = [
  'hmmm',
  'yourNewSubreddit',
  // ... more
];
```

### Adjust Auto-Morph Timing

Edit `components/DynamicFeed.tsx`:

```typescript
const interval = setInterval(() => {
  changeTheme();
}, 30000); // Change this value (in milliseconds)
```

### Modify AI Personalities

Edit the system prompt in `lib/openai.ts` to create different personality types.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables in Production

Required environment variables:
- `OPENAI_API_KEY` (required)
- `REDDIT_CLIENT_ID` (required)
- `REDDIT_CLIENT_SECRET` (required)

Add these in your Vercel project settings under "Environment Variables".

## ⚠️ Notes & Limitations

- **OpenAI Costs**: Each page load and theme change uses GPT-4 tokens. Monitor your usage!
- **Reddit Rate Limits**: The public API has generous limits, but may occasionally hit rate limits during heavy use
- **Image Loading**: Some Reddit images may fail to load due to CORS or deleted posts
- **Browser Support**: Best experienced on modern browsers with JavaScript enabled
- **NSFW Content**: Filtered out automatically for a safe browsing experience

## 🐛 Troubleshooting

**"Failed to fetch feed"**
- Check your OpenAI API key is valid
- Ensure you have credits in your OpenAI account
- Check your internet connection

**Images not loading**
- Some Reddit images have CORS restrictions
- The app filters out non-image posts automatically
- Try refreshing for new content

**Theme not changing**
- Check browser console for errors
- Ensure OpenAI API key is set correctly
- Try manually clicking "New Theme" button

## 🎨 Design Philosophy

This project embraces chaos and unpredictability:
- No two visits are the same
- AI-generated personalities add humor and absurdity
- Visual design morphs constantly
- Content is intentionally weird and off-the-wall

It's an experiment in creating a "living" web page that evolves and surprises users with every interaction.

## 📝 License

ISC

## 🙏 Acknowledgments

- OpenAI for GPT-4
- Reddit for the endless supply of weird content
- All the quirky subreddit communities

---

**Built with chaos, powered by AI, fueled by Reddit. Never the same twice.** ✨
