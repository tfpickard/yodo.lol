# Railway Deployment Guide for yodo.lol

This guide will help you deploy your Next.js app to Railway in under 5 minutes.

## Prerequisites

You need the following API keys ready:

1. **OpenAI API Key** (Required)
   - Get it from: https://platform.openai.com/api-keys
   - Click "Create new secret key"

2. **Reddit API Credentials** (Required)
   - Go to: https://www.reddit.com/prefs/apps
   - Click "Create App" or "Create Another App"
   - Choose "script" as the app type
   - Name: `yodo.lol` (or whatever you want)
   - Description: `AI-powered Reddit feed`
   - Redirect URI: `http://localhost:3000` (can be anything)
   - Click "Create app"
   - Copy the **Client ID** (under the app name) and **Secret**

## Deployment Steps

### Option 1: Deploy via Dashboard (Easiest - 2 minutes)

1. **Go to Railway**
   - Visit: https://railway.app/new
   - Sign in with GitHub

2. **Create New Project**
   - Click "Deploy from GitHub repo"
   - Select your repository: `tfpickard/yodo.lol`
   - Select branch: `claude/research-hosting-options-011CUSnTDJvhdJMV7Yzk2nYQ` (or `main` if you've merged)

3. **Add Environment Variables**
   - Railway will auto-detect Next.js
   - Click on your service
   - Go to "Variables" tab
   - Add these three variables:
     ```
     OPENAI_API_KEY=sk-...your-key-here
     REDDIT_CLIENT_ID=your-client-id
     REDDIT_CLIENT_SECRET=your-secret-here
     ```

4. **Deploy**
   - Railway will automatically deploy
   - Wait 2-4 minutes for build to complete
   - Your app will be live at a Railway-provided URL (something like `yourapp.up.railway.app`)

5. **Add Custom Domain (Optional)**
   - Go to "Settings" tab
   - Click "Generate Domain" for a Railway domain
   - Or add your own custom domain (like `yodo.lol`)

### Option 2: Deploy via CLI (For developers)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables
railway variables set OPENAI_API_KEY=sk-...your-key
railway variables set REDDIT_CLIENT_ID=your-client-id
railway variables set REDDIT_CLIENT_SECRET=your-secret

# Deploy
railway up
```

## Post-Deployment

### Verify Everything Works

1. Visit your Railway URL
2. Check that:
   - The site loads without errors
   - Images appear from Reddit
   - AI-generated themes are working
   - AI captions are displaying

### Monitor Your App

- **Logs**: Click "Deployments" → Select deployment → View logs
- **Metrics**: Check CPU, Memory, Network usage in the dashboard
- **Usage**: Monitor your monthly costs in the billing section

### Expected Costs

- **First month**: Free ($5 credit)
- **After**: ~$5-10/month depending on traffic
- Railway charges based on usage (RAM, CPU, bandwidth)

## Troubleshooting

### Build Fails
- Check logs in Railway dashboard
- Ensure all environment variables are set
- Verify your `package.json` has the correct build command

### App is Slow
- Railway should be much faster than Vercel for your use case
- Check if OpenAI API is responding slowly (not Railway's fault)
- Consider upgrading Railway instance if needed

### Environment Variables Not Working
- Make sure you added them in Railway dashboard
- Redeploy after adding variables (click "Redeploy" button)
- Variables should NOT have quotes around them

## Migrating from Vercel

If you want to keep Vercel as backup:

1. Keep your Vercel deployment as-is
2. Deploy to Railway
3. Test Railway thoroughly
4. Update DNS to point to Railway when ready
5. (Optional) Remove Vercel deployment

## Updating Your App

Railway auto-deploys on every push to your GitHub branch:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Railway automatically rebuilds and deploys
```

## Getting Help

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Status Page: https://status.railway.app

## Next Steps

After deployment:
- Set up custom domain at `yodo.lol`
- Monitor costs and performance
- Enjoy your fast, non-sluggish site!
