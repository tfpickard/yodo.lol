# Environment Variables Reference

Quick reference for deploying yodo.lol to any platform.

## Required Variables

### 1. OPENAI_API_KEY
**Required**: Yes
**Get it from**: https://platform.openai.com/api-keys
**Format**: `sk-proj-...` (starts with sk-)
**Used for**: AI-generated themes and post captions

**How to get it:**
1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "+ Create new secret key"
4. Name it "yodo.lol" (or whatever)
5. Copy the key (starts with `sk-proj-...`)
6. Save it immediately (you can't see it again!)

### 2. REDDIT_CLIENT_ID
**Required**: Yes (for production)
**Get it from**: https://www.reddit.com/prefs/apps
**Format**: 14-character string (looks like: `abc123XYZ456-A`)
**Used for**: Fetching Reddit posts with authentication

**How to get it:**
1. Go to https://www.reddit.com/prefs/apps
2. Log in to Reddit
3. Scroll to bottom, click "create another app..."
4. Fill in:
   - **name**: `yodo.lol`
   - **type**: Select "script"
   - **description**: `AI-powered Reddit feed`
   - **about url**: (leave blank)
   - **redirect uri**: `http://localhost:3000`
5. Click "create app"
6. The **client ID** is the string under your app name
7. The **secret** is labeled "secret"

### 3. REDDIT_CLIENT_SECRET
**Required**: Yes (for production)
**Get it from**: Same as above (https://www.reddit.com/prefs/apps)
**Format**: Longer string (looks like: `aBcDeFgHiJkLmNoPqRsTuVwXyZ`)
**Used for**: Reddit API authentication

## Platform-Specific Setup

### Railway
```bash
# Via Dashboard
1. Go to your Railway project
2. Click "Variables" tab
3. Add each variable with the "+ New Variable" button

# Via CLI
railway variables set OPENAI_API_KEY="your-key"
railway variables set REDDIT_CLIENT_ID="your-id"
railway variables set REDDIT_CLIENT_SECRET="your-secret"
```

### Fly.io
```bash
# Via CLI
flyctl secrets set OPENAI_API_KEY="your-key"
flyctl secrets set REDDIT_CLIENT_ID="your-id"
flyctl secrets set REDDIT_CLIENT_SECRET="your-secret"
```

### DigitalOcean App Platform
```bash
# Via Dashboard
1. Go to your app
2. Click "Settings" → "App-Level Environment Variables"
3. Add each variable
4. Click "Save"
```

### Vercel (current)
```bash
# Via Dashboard
1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add each variable
4. Select all environments (Production, Preview, Development)

# Via CLI
vercel env add OPENAI_API_KEY
vercel env add REDDIT_CLIENT_ID
vercel env add REDDIT_CLIENT_SECRET
```

## Testing Locally

Create a `.env.local` file in the root of your project:

```bash
# .env.local (DO NOT COMMIT THIS FILE)
OPENAI_API_KEY=sk-proj-your-key-here
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-secret
```

Then run:
```bash
npm run dev
```

Visit http://localhost:3000 to test.

## Security Notes

- **NEVER** commit your `.env.local` or `.env` files to git
- **NEVER** share your API keys publicly
- **NEVER** post your keys in Discord, Slack, or any chat
- If you accidentally expose a key, **revoke it immediately** and create a new one

## Troubleshooting

### "OPENAI_API_KEY environment variable is required"
- Make sure you added the variable in your hosting platform
- Redeploy after adding the variable
- Check for typos in the variable name (must be exact)

### "Failed to fetch Reddit posts"
- Verify Reddit credentials are correct
- Make sure you selected "script" type when creating the Reddit app
- Try regenerating the Reddit secret

### App works locally but not in production
- Ensure variables are set in the hosting platform (not just locally)
- Variables in Railway/Fly.io/etc are separate from your local `.env.local`
- Check deployment logs for specific error messages

## Cost Estimates

### OpenAI API Usage
- ~$0.002 per theme generation (GPT-4 Turbo)
- ~$0.005 per post enhancement batch
- Estimated: $5-15/month depending on traffic

### Reddit API
- **Free** (no cost)
- Rate limits: 60 requests per minute (plenty for this app)

### Hosting (Railway)
- ~$5-10/month
- Based on CPU, RAM, and bandwidth usage
