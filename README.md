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
- Reddit API credentials (optional, but recommended for higher rate limits)

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

   # Optional: Reddit API Credentials (get from https://www.reddit.com/prefs/apps)
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   REDDIT_USER_AGENT=YodoLol:v1.0.0 (by /u/yourusername)
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

### Reddit API Credentials (Optional)

Without Reddit credentials, the app will still work but with rate limits.

To get unlimited access:

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Fill in the form:
   - **name**: YODO.LOL (or anything you want)
   - **type**: script
   - **description**: Personal Reddit feed app
   - **redirect uri**: http://localhost:3000
4. Click "Create app"
5. Copy the client ID (under your app name) and client secret
6. Add them to your `.env` file

## 🎨 How It Works

### 1. Reddit Content Fetching (`lib/reddit.ts`)
- Randomly selects 5 quirky subreddits
- Fetches hot posts with images
- Works with or without Reddit API credentials

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
- **Reddit API**: Snoowrap + Public JSON API
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

Make sure to add these in your deployment platform:
- `OPENAI_API_KEY`
- `REDDIT_CLIENT_ID` (optional)
- `REDDIT_CLIENT_SECRET` (optional)
- `REDDIT_USER_AGENT` (optional)

## ⚠️ Notes & Limitations

- **OpenAI Costs**: Each page load and theme change uses GPT-4 tokens. Monitor your usage!
- **Rate Limits**: Without Reddit credentials, you're limited to ~60 requests per hour
- **Image Loading**: Some Reddit images may fail to load due to CORS or deleted posts
- **Browser Support**: Best experienced on modern browsers with JavaScript enabled

## 🐛 Troubleshooting

**"Failed to fetch feed"**
- Check your OpenAI API key is valid
- Ensure you have credits in your OpenAI account
- Check Reddit API credentials if using them

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
