# DigitalOcean Droplet Deployment Guide

Complete guide for hosting this Next.js application securely on a DigitalOcean Droplet, with support for multiple websites and domains on a single server.

## Table of Contents

1. [Overview](#overview)
2. [Droplet Setup](#droplet-setup)
3. [Initial Server Security](#initial-server-security)
4. [Node.js Installation](#nodejs-installation)
5. [Application Deployment](#application-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL/TLS with Let's Encrypt](#ssltls-with-lets-encrypt)
8. [Process Management with PM2](#process-management-with-pm2)
9. [Hosting Multiple Websites](#hosting-multiple-websites)
10. [Security Hardening](#security-hardening)
11. [Monitoring and Maintenance](#monitoring-and-maintenance)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will help you deploy a Next.js 15 application on a DigitalOcean Droplet with:

- **Nginx** as a reverse proxy
- **PM2** for process management
- **Let's Encrypt** for free SSL certificates
- **UFW** firewall configuration
- **Fail2ban** for brute-force protection
- Support for **multiple domains** on one server

**Estimated Monthly Cost:** $6-12 (Basic Droplet) + OpenAI API usage ($5-15)

---

## Droplet Setup

### 1. Create a DigitalOcean Droplet

1. Log in to [DigitalOcean](https://www.digitalocean.com)
2. Click **Create** → **Droplets**
3. Choose the following configuration:

   **Image:** Ubuntu 22.04 LTS (recommended)

   **Droplet Type:**
   - **Basic** - Shared CPU ($6/month minimum)
   - Recommended: **Regular** - $12/month (2GB RAM, 1 vCPU, 50GB SSD)
     - 1GB RAM may struggle with Next.js builds
     - 2GB RAM provides comfortable headroom

   **Datacenter Region:** Choose closest to your target audience

   **Authentication:**
   - **SSH Keys** (recommended) - Upload your public key
   - Or use password (less secure, will prompt to change)

   **Hostname:** Choose a memorable name (e.g., `yodo-lol-prod`)

4. Click **Create Droplet**
5. Note the droplet's IP address (e.g., `157.230.XXX.XXX`)

### 2. Connect to Your Droplet

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Example:
ssh root@157.230.123.456
```

---

## Initial Server Security

### 1. Update System Packages

```bash
# Update package lists and upgrade installed packages
apt update && apt upgrade -y
```

### 2. Create a Non-Root User

```bash
# Create a new user (replace 'deploy' with your preferred username)
adduser deploy

# Add user to sudo group
usermod -aG sudo deploy

# Grant sudo without password (optional, for convenience)
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy
```

### 3. Configure SSH for New User

```bash
# Copy SSH authorized keys to new user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 4. Harden SSH Configuration

```bash
# Edit SSH config
nano /etc/ssh/sshd_config
```

Make these changes:

```conf
# Disable root login
PermitRootLogin no

# Disable password authentication (use SSH keys only)
PasswordAuthentication no

# Only allow specific user
AllowUsers deploy

# Change SSH port (optional, but recommended)
# Port 2222

# Disable empty passwords
PermitEmptyPasswords no

# Use protocol 2 only
Protocol 2
```

Restart SSH:

```bash
systemctl restart sshd
```

**Important:** Before logging out, test SSH access with the new user in a separate terminal:

```bash
# From your local machine
ssh deploy@YOUR_DROPLET_IP

# If you changed the SSH port:
ssh -p 2222 deploy@YOUR_DROPLET_IP
```

### 5. Configure UFW Firewall

```bash
# Allow SSH (use your custom port if changed)
ufw allow 22/tcp
# Or if you changed SSH port: ufw allow 2222/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status verbose
```

---

## Node.js Installation

### 1. Install Node.js 20.x (LTS)

```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

### 2. Install Build Tools

```bash
# Install essential build tools
sudo apt install -y build-essential

# Install PM2 globally
sudo npm install -g pm2
```

---

## Application Deployment

### 1. Set Up Git Access

```bash
# Generate SSH key for GitHub access (if needed)
ssh-keygen -t ed25519 -C "deploy@yodo.lol"

# Display public key
cat ~/.ssh/id_ed25519.pub

# Add this key to your GitHub account:
# https://github.com/settings/keys
```

### 2. Clone Repository

```bash
# Create applications directory
mkdir -p ~/apps
cd ~/apps

# Clone your repository
git clone git@github.com:tfpickard/yodo.lol.git
cd yodo.lol

# Checkout appropriate branch (if not main)
git checkout your-production-branch
```

### 3. Configure Environment Variables

```bash
# Create production environment file
nano .env.local
```

Add the following (replace with your actual values):

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

# Reddit API Configuration (Production)
REDDIT_CLIENT_ID=YOUR_14_CHAR_CLIENT_ID
REDDIT_CLIENT_SECRET=YOUR_REDDIT_CLIENT_SECRET

# Node Environment
NODE_ENV=production

# Optional: Custom port (PM2 will manage this)
PORT=3000
```

**Security:** Protect this file:

```bash
chmod 600 .env.local
```

### 4. Install Dependencies and Build

```bash
# Install dependencies
npm ci --production=false

# Build the application
npm run build

# Test production build locally
npm start
# Press Ctrl+C to stop
```

**Note:** The build process may take 5-10 minutes on a basic droplet.

---

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Create Nginx Configuration for Your Site

```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/yodo.lol
```

Add the following configuration:

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

# Upstream for Next.js
upstream nextjs_yodo {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name yodo.lol www.yodo.lol;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Access logs
    access_log /var/log/nginx/yodo.lol.access.log;
    error_log /var/log/nginx/yodo.lol.error.log;

    # Client body size limit
    client_max_body_size 10M;

    # Rate limiting
    limit_req zone=general burst=20 nodelay;

    location / {
        # Proxy to Next.js
        proxy_pass http://nextjs_yodo;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Cache control
        proxy_cache_bypass $http_upgrade;
    }

    # API routes with higher rate limit
    location /api/ {
        limit_req zone=api burst=50 nodelay;

        proxy_pass http://nextjs_yodo;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Longer timeout for API calls (OpenAI/Reddit)
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://nextjs_yodo;
        proxy_http_version 1.1;
        proxy_set_header Host $host;

        # Cache static assets
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Favicon and robots.txt
    location = /favicon.ico {
        proxy_pass http://nextjs_yodo;
        access_log off;
    }

    location = /robots.txt {
        proxy_pass http://nextjs_yodo;
        access_log off;
    }
}
```

### 3. Enable the Site

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/yodo.lol /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Configure DNS

Before SSL setup, point your domain to the droplet:

1. Log in to your domain registrar (Namecheap, GoDaddy, etc.)
2. Go to DNS settings for your domain
3. Add/Update A records:

   ```
   Type    Host    Value               TTL
   A       @       YOUR_DROPLET_IP     300
   A       www     YOUR_DROPLET_IP     300
   ```

4. Wait for DNS propagation (5 minutes to 48 hours, usually ~15 minutes)
5. Test with: `dig yodo.lol` or `nslookup yodo.lol`

---

## SSL/TLS with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Obtain and install certificate automatically
sudo certbot --nginx -d yodo.lol -d www.yodo.lol

# Follow prompts:
# - Enter email address for urgent renewal notices
# - Agree to Terms of Service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### 3. Test Auto-Renewal

```bash
# Dry run to test renewal
sudo certbot renew --dry-run
```

Certbot automatically sets up a cron job for renewal. Certificates are valid for 90 days and auto-renew at 60 days.

### 4. Verify SSL Configuration

```bash
# Check certificate status
sudo certbot certificates

# Test SSL with:
curl https://yodo.lol
```

Visit https://www.ssllabs.com/ssltest/ to verify your SSL configuration.

---

## Process Management with PM2

### 1. Create PM2 Ecosystem File

```bash
cd ~/apps/yodo.lol

# Create PM2 configuration
nano ecosystem.config.js
```

Add the following:

```javascript
module.exports = {
  apps: [{
    name: 'yodo-lol',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/deploy/apps/yodo.lol',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/deploy/logs/yodo-lol-error.log',
    out_file: '/home/deploy/logs/yodo-lol-out.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

### 2. Create Logs Directory

```bash
mkdir -p ~/logs
```

### 3. Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs yodo-lol

# Monitor resources
pm2 monit
```

### 4. Configure PM2 Startup Script

```bash
# Generate startup script
pm2 startup systemd -u deploy --hp /home/deploy

# Save current PM2 process list
pm2 save
```

This ensures your application starts automatically on server reboot.

### 5. Useful PM2 Commands

```bash
# Restart application
pm2 restart yodo-lol

# Stop application
pm2 stop yodo-lol

# View detailed info
pm2 info yodo-lol

# View real-time logs
pm2 logs yodo-lol --lines 100

# Clear logs
pm2 flush

# Monitor CPU/memory
pm2 monit

# Delete from PM2
pm2 delete yodo-lol
```

---

## Hosting Multiple Websites

One of the key advantages of using a droplet is the ability to host multiple websites on a single server.

### Architecture

- **Nginx** acts as a reverse proxy, routing requests based on domain
- Each application runs on a **different port** (3000, 3001, 3002, etc.)
- **PM2** manages all processes
- **SSL certificates** for each domain via Certbot

### Example: Adding a Second Website

#### 1. Deploy Second Application

```bash
cd ~/apps

# Clone second repository
git clone git@github.com:username/second-app.git
cd second-app

# Configure environment
nano .env.local
# Add necessary environment variables

# Install and build
npm ci
npm run build
```

#### 2. Create PM2 Configuration

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'second-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/deploy/apps/second-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001  // Different port!
    },
    error_file: '/home/deploy/logs/second-app-error.log',
    out_file: '/home/deploy/logs/second-app-out.log',
    time: true
  }]
}
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
```

#### 3. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/second-app.com
```

```nginx
upstream nextjs_second {
    server localhost:3001;  # Different port!
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name second-app.com www.second-app.com;

    access_log /var/log/nginx/second-app.access.log;
    error_log /var/log/nginx/second-app.error.log;

    location / {
        proxy_pass http://nextjs_second;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/second-app.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Configure DNS

Add A records for `second-app.com` pointing to your droplet IP.

#### 5. Add SSL Certificate

```bash
sudo certbot --nginx -d second-app.com -d www.second-app.com
```

### Multi-Site PM2 Management

You can manage all sites with a single ecosystem file:

```bash
# Create combined configuration
nano ~/apps/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'yodo-lol',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/deploy/apps/yodo.lol',
      instances: 1,
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'second-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/deploy/apps/second-app',
      instances: 1,
      env: { NODE_ENV: 'production', PORT: 3001 }
    },
    {
      name: 'third-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/deploy/apps/third-app',
      instances: 1,
      env: { NODE_ENV: 'production', PORT: 3002 }
    }
  ]
}
```

Manage all at once:

```bash
# Start all apps
pm2 start ~/apps/ecosystem.config.js

# Restart all
pm2 restart all

# View status of all apps
pm2 status

# View logs from all apps
pm2 logs
```

---

## Security Hardening

### 1. Install Fail2ban

Fail2ban protects against brute-force attacks by banning IPs with too many failed login attempts.

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Enable SSH protection:

```conf
[sshd]
enabled = true
port = 22  # Or your custom SSH port
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

Add Nginx protection:

```conf
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
```

Start Fail2ban:

```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status

# Check SSH jail
sudo fail2ban-client status sshd
```

### 2. Enable Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

### 3. Configure Log Rotation

```bash
sudo nano /etc/logrotate.d/nginx-apps
```

```conf
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}

/home/deploy/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
}
```

### 4. Secure Environment Variables

Never commit `.env.local` files. Use secure practices:

```bash
# Set strict permissions
chmod 600 ~/apps/yodo.lol/.env.local

# Create backup (encrypted)
sudo apt install -y gpg
gpg -c ~/apps/yodo.lol/.env.local
# Store the .env.local.gpg file securely off-server

# Restore if needed
gpg -d ~/apps/yodo.lol/.env.local.gpg > ~/apps/yodo.lol/.env.local
```

### 5. Regular Security Audits

```bash
# Check for outdated packages
npm outdated

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies
npm update
```

### 6. Disable Unused Services

```bash
# List running services
systemctl list-unit-files --type=service --state=enabled

# Disable unnecessary services (example)
sudo systemctl disable bluetooth
sudo systemctl disable cups
```

---

## Monitoring and Maintenance

### 1. Server Monitoring

#### Install htop

```bash
sudo apt install -y htop

# Run
htop
```

#### Check Disk Space

```bash
df -h
```

#### Check Memory Usage

```bash
free -h
```

#### Monitor Nginx

```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View access logs
sudo tail -f /var/log/nginx/yodo.lol.access.log

# View error logs
sudo tail -f /var/log/nginx/yodo.lol.error.log
```

### 2. Application Monitoring

#### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View metrics
pm2 status

# Logs
pm2 logs yodo-lol --lines 50
```

#### Set Up PM2 Web Interface (Optional)

```bash
# Install PM2 web interface
pm2 install pm2-server-monit

# Access at: http://YOUR_IP:9615
# Add firewall rule: sudo ufw allow 9615/tcp
```

### 3. Backup Strategy

#### Automated Backup Script

```bash
# Create backup script
nano ~/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APPS_DIR="/home/deploy/apps"

mkdir -p $BACKUP_DIR

# Backup application code and env files
tar -czf $BACKUP_DIR/apps_$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    $APPS_DIR

# Backup Nginx configs
sudo tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz \
    /etc/nginx/sites-available \
    /etc/nginx/sites-enabled \
    /etc/nginx/nginx.conf

# Backup SSL certificates
sudo tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz \
    /etc/letsencrypt

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:

```bash
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/deploy/backup.sh >> /home/deploy/logs/backup.log 2>&1
```

### 4. Update Workflow

```bash
cd ~/apps/yodo.lol

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Restart with PM2
pm2 restart yodo-lol

# Check status
pm2 logs yodo-lol --lines 50
```

### 5. DigitalOcean Monitoring (Optional)

Enable DigitalOcean's built-in monitoring:

1. Go to your Droplet in the DigitalOcean dashboard
2. Navigate to **Monitoring** tab
3. Install the monitoring agent:

```bash
curl -sSL https://repos.insights.digitalocean.com/install.sh | sudo bash
```

This provides:
- CPU usage graphs
- Memory usage
- Disk I/O
- Network bandwidth
- Alerts for threshold breaches

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs yodo-lol --err --lines 100

# Common issues:
# 1. Port already in use
sudo lsof -i :3000
# Kill process: sudo kill -9 <PID>

# 2. Missing environment variables
cat ~/apps/yodo.lol/.env.local

# 3. Build errors
cd ~/apps/yodo.lol
npm run build
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check if Nginx is running
sudo systemctl status nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nano /etc/nginx/sites-available/yodo.lol

# Test SSL
curl -vI https://yodo.lol
```

### High Memory Usage

```bash
# Check memory
free -h

# Identify process
htop

# Restart application
pm2 restart yodo-lol

# Add swap if needed (2GB example)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### DNS Not Resolving

```bash
# Check DNS propagation
dig yodo.lol
nslookup yodo.lol

# Verify A records point to correct IP
# Wait up to 48 hours for full propagation
```

### Firewall Blocking Traffic

```bash
# Check firewall status
sudo ufw status verbose

# Ensure ports are open
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check if Nginx is listening
sudo netstat -tlnp | grep nginx
```

### 502 Bad Gateway

This usually means Nginx can't reach the application:

```bash
# Check if app is running
pm2 status

# Check if app is listening on correct port
sudo lsof -i :3000

# Restart application
pm2 restart yodo-lol

# Check Nginx upstream configuration
sudo nano /etc/nginx/sites-available/yodo.lol
```

---

## Quick Reference

### Common Commands

```bash
# SSH into droplet
ssh deploy@YOUR_DROPLET_IP

# Update application
cd ~/apps/yodo.lol && git pull && npm ci && npm run build && pm2 restart yodo-lol

# View application logs
pm2 logs yodo-lol

# Check PM2 status
pm2 status

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx config
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/yodo.lol.access.log

# Check disk space
df -h

# Check memory
free -h

# Monitor resources
htop

# Renew SSL
sudo certbot renew

# Check firewall
sudo ufw status
```

### File Locations

```
Applications:        /home/deploy/apps/
Logs:                /home/deploy/logs/
Nginx configs:       /etc/nginx/sites-available/
Nginx logs:          /var/log/nginx/
SSL certificates:    /etc/letsencrypt/live/
Environment files:   /home/deploy/apps/*/. env.local
PM2 startup script:  /etc/systemd/system/pm2-deploy.service
```

---

## Estimated Costs

### Monthly Breakdown

| Item | Cost |
|------|------|
| DigitalOcean Droplet (Basic, 2GB) | $12 |
| OpenAI API (moderate usage) | $5-15 |
| Domain name (annual/12) | $1 |
| **Total** | **$18-28/month** |

### Cost Optimization Tips

1. **Droplet Size**: Start with $6/month (1GB) if traffic is low, upgrade if needed
2. **Multiple Sites**: Hosting 3-5 sites on one droplet = $2-4/site
3. **Reserved IPs**: Free with droplet (normally $4/month standalone)
4. **Bandwidth**: 1TB included (sufficient for most small-medium sites)
5. **Backups**: Manual backups are free; DigitalOcean backups add 20% to cost

---

## Next Steps

1. **Set up monitoring alerts** - Configure DigitalOcean monitoring or use external services (UptimeRobot, Pingdom)
2. **Implement CI/CD** - Automate deployments with GitHub Actions
3. **Add database** - If needed, install PostgreSQL/MySQL or use DigitalOcean Managed Databases
4. **Optimize performance** - Enable caching, add CDN (Cloudflare), optimize images
5. **Scale horizontally** - Add load balancing when traffic grows

---

## Additional Resources

- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [UFW Documentation](https://help.ubuntu.com/community/UFW)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs: `pm2 logs yodo-lol`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify DNS and SSL: https://www.ssllabs.com/ssltest/
5. DigitalOcean Community: https://www.digitalocean.com/community

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
