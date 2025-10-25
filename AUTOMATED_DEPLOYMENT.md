# Automated DigitalOcean Deployment

Complete automation for deploying your Next.js application to DigitalOcean with CI/CD via GitHub Actions.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [GitHub Secrets Configuration](#github-secrets-configuration)
6. [GitHub Deploy Keys Setup](#github-deploy-keys-setup)
7. [Manual Deployment](#manual-deployment)
8. [Automated CI/CD](#automated-cicd)
9. [Managing Multiple Sites](#managing-multiple-sites)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This automated deployment system includes:

- **`scripts/create-droplet.sh`** - Creates and configures a DigitalOcean droplet via API
- **`scripts/deploy.sh`** - Deploys your application on the server
- **`.github/workflows/deploy.yml`** - GitHub Actions workflow for automatic deployment

### What Gets Automated

✅ Droplet creation and provisioning
✅ Security hardening (firewall, SSH, fail2ban)
✅ Nginx installation and configuration
✅ SSL certificate setup with Let's Encrypt
✅ PM2 process management
✅ Automatic deployment on push to main branch
✅ Zero-downtime updates

---

## Prerequisites

### Local Machine

- **jq** - JSON processor
  ```bash
  # Ubuntu/Debian
  sudo apt install jq

  # macOS
  brew install jq
  ```

- **curl** - Should be pre-installed

- **SSH client** - Should be pre-installed

### DigitalOcean Account

1. Create a DigitalOcean account at https://www.digitalocean.com
2. Create a Personal Access Token:
   - Go to **API** → **Tokens/Keys**
   - Click **Generate New Token**
   - Name: `terraform-automation` or similar
   - Scopes: **Read and Write**
   - Copy the token (you won't see it again!)

### GitHub Repository

- Admin access to the repository
- Ability to add secrets and deploy keys

---

## Quick Start

### 1. Create Droplet (One-Time Setup)

```bash
# Set your DigitalOcean API token
export DO_API_TOKEN="dop_v1_xxxxxxxxxxxxxxxxxxxxx"

# Optional: Customize droplet settings
export DROPLET_NAME="yodo-lol-prod"
export REGION="nyc1"          # Or: sfo1, lon1, fra1, sgp1, etc.
export SIZE="s-1vcpu-2gb"     # Or: s-1vcpu-1gb, s-2vcpu-4gb, etc.

# Run the creation script
chmod +x scripts/create-droplet.sh
./scripts/create-droplet.sh
```

**This will take 3-5 minutes.** The script will:
- Create the droplet
- Install Node.js, Nginx, PM2, Certbot
- Configure firewall and security settings
- Output the droplet's IP address

### 2. Configure DNS

Point your domain to the droplet IP:

```
Type: A    Host: @      Value: YOUR_DROPLET_IP    TTL: 300
Type: A    Host: www    Value: YOUR_DROPLET_IP    TTL: 300
```

Wait for DNS propagation (usually 5-15 minutes).

### 3. Set Up GitHub Secrets and Deploy Key

See [GitHub Secrets Configuration](#github-secrets-configuration) and [GitHub Deploy Keys Setup](#github-deploy-keys-setup) below.

### 4. Push to Deploy

```bash
git push origin main
```

GitHub Actions will automatically deploy your application! 🚀

---

## Step-by-Step Setup

### Step 1: Create and Configure Droplet

#### 1.1 Get DigitalOcean API Token

1. Log in to [DigitalOcean](https://cloud.digitalocean.com)
2. Navigate to **API** → **Tokens/Keys** → **Personal Access Tokens**
3. Click **Generate New Token**
4. Name: `deployment-automation`
5. Scopes: Check **Read** and **Write**
6. Click **Generate Token**
7. **Copy the token immediately** (it won't be shown again)

#### 1.2 Add SSH Key to DigitalOcean

If you haven't already:

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Display public key
cat ~/.ssh/id_ed25519.pub
```

Add to DigitalOcean:
1. Go to **Settings** → **Security** → **SSH Keys**
2. Click **Add SSH Key**
3. Paste your public key
4. Name it (e.g., "My Laptop")

#### 1.3 Run Droplet Creation Script

```bash
# Clone your repository locally (if not already)
git clone git@github.com:tfpickard/yodo.lol.git
cd yodo.lol

# Set your API token
export DO_API_TOKEN="dop_v1_your_token_here"

# Optional: Customize settings
export DROPLET_NAME="yodo-lol-prod"
export REGION="nyc1"              # Choose closest to your audience
export SIZE="s-1vcpu-2gb"         # Recommended for Next.js

# Make script executable
chmod +x scripts/create-droplet.sh

# Run the script
./scripts/create-droplet.sh
```

**Available Regions:**
- `nyc1`, `nyc3` - New York
- `sfo3` - San Francisco
- `tor1` - Toronto
- `lon1` - London
- `fra1` - Frankfurt
- `ams3` - Amsterdam
- `sgp1` - Singapore
- `blr1` - Bangalore

**Available Sizes:**
- `s-1vcpu-1gb` - $6/month (minimum, may struggle with builds)
- `s-1vcpu-2gb` - $12/month (recommended)
- `s-2vcpu-2gb` - $18/month
- `s-2vcpu-4gb` - $24/month

#### 1.4 Save Droplet Information

After the script completes, you'll see output like:

```
Droplet IP: 157.230.123.456
```

**Save this IP address** - you'll need it for DNS and GitHub Secrets.

### Step 2: Configure DNS

#### Option A: Using Your Domain Registrar

1. Log in to your domain registrar (Namecheap, GoDaddy, etc.)
2. Go to DNS settings for your domain
3. Add these A records:

```
Type    Host    Value               TTL
A       @       157.230.123.456     300
A       www     157.230.123.456     300
```

#### Option B: Using DigitalOcean DNS

1. Go to **Networking** → **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Click **Add Domain**
5. Create A records:
   - **Hostname:** `@` → **Will Direct To:** Select your droplet
   - **Hostname:** `www` → **Will Direct To:** Select your droplet

Update nameservers at your registrar:
```
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

#### Verify DNS Propagation

```bash
# Check DNS resolution
dig yodo.lol
nslookup yodo.lol

# Should return your droplet IP
```

---

## GitHub Secrets Configuration

GitHub Secrets store sensitive information securely and make it available to GitHub Actions.

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `SSH_PRIVATE_KEY` | Private SSH key for server access | Generate new deploy key (see below) |
| `SSH_HOST` | Droplet IP address | From create-droplet.sh output |
| `SSH_USER` | SSH username (usually `deploy`) | Default: `deploy` |
| `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |
| `REDDIT_CLIENT_ID` | Reddit app client ID | https://www.reddit.com/prefs/apps |
| `REDDIT_CLIENT_SECRET` | Reddit app client secret | https://www.reddit.com/prefs/apps |

### Adding Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:

#### SSH_PRIVATE_KEY

See [GitHub Deploy Keys Setup](#github-deploy-keys-setup) section below.

#### SSH_HOST

```
Name: SSH_HOST
Value: 157.230.123.456
```
(Use your actual droplet IP)

#### SSH_USER

```
Name: SSH_USER
Value: deploy
```

#### OPENAI_API_KEY

1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Copy the key
4. In GitHub:
   ```
   Name: OPENAI_API_KEY
   Value: sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

#### REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET

1. Go to https://www.reddit.com/prefs/apps
2. Click **create another app...** (or **create app**)
3. Fill in:
   - **name:** yodo.lol production
   - **type:** script
   - **description:** Production app for yodo.lol
   - **about url:** (leave blank)
   - **redirect uri:** http://localhost
4. Click **create app**
5. You'll see:
   - **Client ID:** (14 characters under the app name)
   - **Secret:** (long string)

6. In GitHub, add both:
   ```
   Name: REDDIT_CLIENT_ID
   Value: your_14_char_id

   Name: REDDIT_CLIENT_SECRET
   Value: your_long_secret_string
   ```

---

## GitHub Deploy Keys Setup

**Yes, you need to create a deploy key!** This allows GitHub Actions to SSH into your server.

### Why a Separate Deploy Key?

- **Security:** Dedicated key just for deployment
- **Isolation:** Revoke without affecting your personal SSH access
- **Best Practice:** Different keys for different purposes

### Step-by-Step: Create Deploy Key

#### 1. SSH into Your Droplet

```bash
ssh deploy@YOUR_DROPLET_IP
```

#### 2. Generate a New SSH Key on the Server

```bash
# On the server
ssh-keygen -t ed25519 -C "github-deploy-key" -f ~/.ssh/github_deploy

# Press Enter for no passphrase (required for automated deployments)
```

This creates:
- `~/.ssh/github_deploy` (private key)
- `~/.ssh/github_deploy.pub` (public key)

#### 3. Add Public Key to GitHub (Repository Deploy Key)

```bash
# On the server - display public key
cat ~/.ssh/github_deploy.pub
```

Copy the output, then:

1. Go to your GitHub repository
2. Click **Settings** → **Deploy keys**
3. Click **Add deploy key**
4. Fill in:
   - **Title:** `DigitalOcean Production Server`
   - **Key:** Paste the public key
   - **Allow write access:** ✅ Check this box (required for git pull)
5. Click **Add key**

#### 4. Configure Git to Use Deploy Key

```bash
# On the server
nano ~/.ssh/config
```

Add this configuration:

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    IdentitiesOnly yes
```

Save and exit (Ctrl+X, Y, Enter).

Set permissions:

```bash
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy
```

#### 5. Test GitHub Connection

```bash
# On the server
ssh -T git@github.com

# You should see:
# Hi tfpickard/yodo.lol! You've successfully authenticated, but GitHub does not provide shell access.
```

#### 6. Add Private Key to GitHub Secrets

```bash
# On the server - display private key
cat ~/.ssh/github_deploy
```

Copy the **entire output**, including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Then:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Fill in:
   ```
   Name: SSH_PRIVATE_KEY
   Value: [paste entire private key]
   ```
5. Click **Add secret**

**Important:** Make sure to copy the PRIVATE key (no `.pub` extension), not the public key!

---

## Manual Deployment

You can deploy manually without GitHub Actions:

### First-Time Deployment

```bash
# From your local machine
ssh deploy@YOUR_DROPLET_IP

# On the server
export OPENAI_API_KEY="sk-proj-xxxxx"
export REDDIT_CLIENT_ID="your_id"
export REDDIT_CLIENT_SECRET="your_secret"

# Download and run deployment script
curl -o deploy.sh https://raw.githubusercontent.com/tfpickard/yodo.lol/main/scripts/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### Subsequent Deployments

```bash
ssh deploy@YOUR_DROPLET_IP

# Environment variables are stored in .env.local, so just run:
~/deploy.sh
```

---

## Automated CI/CD

Once you've set up GitHub Secrets and the deploy key, every push to `main` will automatically deploy!

### How It Works

1. You push code to the `main` branch
2. GitHub Actions workflow triggers
3. Code is checked out
4. Deployment script is copied to the server
5. Application is deployed:
   - Repository updated
   - Dependencies installed
   - Application built
   - PM2 restarts the app
   - Nginx configuration updated
6. You receive a success/failure notification

### Monitoring Deployments

1. Go to your GitHub repository
2. Click **Actions** tab
3. See all deployment runs
4. Click on a run to see detailed logs

### Manual Trigger

You can also trigger deployment manually:

1. Go to **Actions** tab
2. Click **Deploy to DigitalOcean** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

### Viewing Logs

After deployment, check application logs:

```bash
ssh deploy@YOUR_DROPLET_IP
pm2 logs yodo-lol
```

---

## Managing Multiple Sites

You can host multiple websites on a single droplet.

### Architecture

- Each site runs on a different port (3000, 3001, 3002, etc.)
- Nginx routes traffic based on domain
- PM2 manages all processes
- Each site has its own SSL certificate

### Adding a Second Site

#### 1. Prepare the Repository

Make sure your second site has:
- `scripts/deploy.sh` (customized for the app)
- Proper environment variables

#### 2. Create GitHub Secrets for Second Site

Add secrets prefixed with the site name:

```
SITE2_SSH_PRIVATE_KEY
SITE2_SSH_HOST (same as first site)
SITE2_SSH_USER (deploy)
SITE2_OPENAI_API_KEY (if needed)
# etc.
```

#### 3. Create GitHub Workflow

Create `.github/workflows/deploy-site2.yml`:

```yaml
name: Deploy Site2 to DigitalOcean

on:
  push:
    branches:
      - main

env:
  NODE_ENV: production
  APP_NAME: site2
  DOMAIN: site2.com
  PORT: 3001  # Different port!

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    steps:
      # ... similar to main deploy.yml, but using SITE2_* secrets
```

#### 4. Update deploy.sh

Customize `APP_NAME`, `DOMAIN`, and `PORT` variables:

```bash
APP_NAME="site2"
DOMAIN="site2.com"
PORT="3001"
```

#### 5. Deploy

Push to main:

```bash
git push origin main
```

Both sites will run on the same droplet!

### Viewing All Sites

```bash
ssh deploy@YOUR_DROPLET_IP
pm2 status

# Should show:
# │ yodo-lol  │ 0  │ 3000 │
# │ site2     │ 1  │ 3001 │
```

---

## Troubleshooting

### Droplet Creation Fails

**Error: "Invalid credentials"**
```bash
# Check your API token
echo $DO_API_TOKEN

# Make sure it starts with dop_v1_
# Regenerate if needed
```

**Error: "No SSH keys found"**
```bash
# Add SSH key to DigitalOcean first
cat ~/.ssh/id_ed25519.pub

# Add at: https://cloud.digitalocean.com/account/security
```

### GitHub Actions Deployment Fails

**Error: "Permission denied (publickey)"**

This means the deploy key isn't set up correctly.

1. Check `SSH_PRIVATE_KEY` secret contains the full private key
2. Verify deploy key is added to GitHub with write access
3. Test SSH connection from server:
   ```bash
   ssh deploy@YOUR_DROPLET_IP
   ssh -T git@github.com
   ```

**Error: "Repository not found"**

The deploy key doesn't have access to the repository.

1. Go to **Settings** → **Deploy keys**
2. Ensure your deploy key has **Allow write access** checked
3. Delete and re-add if needed

**Error: "Missing environment variables"**

Check that all required secrets are set:

```bash
# Go to Settings → Secrets and variables → Actions
# Verify you have:
# - SSH_PRIVATE_KEY
# - SSH_HOST
# - SSH_USER
# - OPENAI_API_KEY
# - REDDIT_CLIENT_ID
# - REDDIT_CLIENT_SECRET
```

### Application Errors

**502 Bad Gateway**

Application isn't running:

```bash
ssh deploy@YOUR_DROPLET_IP
pm2 status
pm2 logs yodo-lol --err

# Restart if needed
pm2 restart yodo-lol
```

**Build Fails**

Check server has enough memory:

```bash
ssh deploy@YOUR_DROPLET_IP
free -h

# If low, add swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**SSL Certificate Fails**

DNS not configured yet:

```bash
ssh deploy@YOUR_DROPLET_IP

# Verify DNS points to server
dig yodo.lol

# Try obtaining certificate manually
sudo certbot --nginx -d yodo.lol -d www.yodo.lol
```

### GitHub Deploy Key Issues

**Error: "Failed to clone repository"**

SSH config on server might be wrong:

```bash
ssh deploy@YOUR_DROPLET_IP

# Check SSH config
cat ~/.ssh/config

# Should have:
# Host github.com
#     IdentityFile ~/.ssh/github_deploy
#     IdentitiesOnly yes

# Test connection
ssh -T git@github.com
```

**Error: "Permission denied"**

Deploy key might not have write access:

1. Go to **Settings** → **Deploy keys**
2. Click on your deploy key
3. Ensure **Allow write access** is checked
4. If not, delete and re-add with write access

---

## Best Practices

### Security

✅ **Use separate deploy keys** for each server
✅ **Store secrets in GitHub Secrets**, never commit to repo
✅ **Enable 2FA** on DigitalOcean and GitHub
✅ **Regularly update** server packages: `sudo apt update && sudo apt upgrade`
✅ **Monitor** application logs: `pm2 logs yodo-lol`
✅ **Backup** environment files securely

### Cost Optimization

💰 **Start small** - $12/month droplet is sufficient
💰 **Host multiple sites** on one droplet
💰 **Monitor API usage** - OpenAI costs can add up
💰 **Use DigitalOcean monitoring** - included free
💰 **Enable backups** only if needed (+20% cost)

### Performance

⚡ **Enable Nginx caching** for static assets
⚡ **Use a CDN** (Cloudflare) for better performance
⚡ **Monitor memory** usage: `htop`
⚡ **Optimize images** before uploading
⚡ **Consider scaling** to larger droplet if needed

---

## Additional Resources

- [DigitalOcean API Documentation](https://docs.digitalocean.com/reference/api/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## Support

### Getting Help

1. Check deployment logs in GitHub Actions
2. SSH into server and check PM2 logs: `pm2 logs yodo-lol`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Review this documentation

### Useful Commands

```bash
# SSH into server
ssh deploy@YOUR_DROPLET_IP

# Check application status
pm2 status

# View logs
pm2 logs yodo-lol

# Restart application
pm2 restart yodo-lol

# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check SSL certificates
sudo certbot certificates

# Renew SSL
sudo certbot renew

# Check disk space
df -h

# Check memory
free -h

# Monitor resources
htop
```

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
