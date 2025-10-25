#!/bin/bash

################################################################################
# Deployment Script for yodo.lol
#
# This script handles deployment of the Next.js application on the server.
# It can be run manually or triggered by GitHub Actions.
#
# Usage:
#   # Manual deployment
#   ./deploy.sh
#
#   # With environment variables (GitHub Actions)
#   OPENAI_API_KEY=xxx REDDIT_CLIENT_ID=yyy REDDIT_CLIENT_SECRET=zzz ./deploy.sh
#
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="${APP_NAME:-yodo-lol}"
APP_DIR="${APP_DIR:-$HOME/apps/yodo.lol}"
REPO_URL="${REPO_URL:-git@github.com:tfpickard/yodo.lol.git}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-yodo.lol}"
PORT="${PORT:-3000}"
NODE_ENV="${NODE_ENV:-production}"

################################################################################
# Helper Functions
################################################################################

print_step() {
    echo ""
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_info() {
    echo -e "${BLUE}   →${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

check_required_env() {
    print_step "Checking environment variables..."

    MISSING_VARS=""

    if [ -z "$OPENAI_API_KEY" ]; then
        MISSING_VARS="${MISSING_VARS}OPENAI_API_KEY "
    fi

    if [ -z "$REDDIT_CLIENT_ID" ]; then
        MISSING_VARS="${MISSING_VARS}REDDIT_CLIENT_ID "
    fi

    if [ -z "$REDDIT_CLIENT_SECRET" ]; then
        MISSING_VARS="${MISSING_VARS}REDDIT_CLIENT_SECRET "
    fi

    if [ -n "$MISSING_VARS" ]; then
        print_error "Missing required environment variables: $MISSING_VARS"
        print_info "Set them in GitHub Secrets or pass them as arguments"
        exit 1
    fi

    print_info "All required environment variables are set ✓"
}

setup_directories() {
    print_step "Setting up directories..."

    mkdir -p "$HOME/apps"
    mkdir -p "$HOME/logs"
    mkdir -p "$HOME/backups"

    print_info "Directories created ✓"
}

setup_ssh_github() {
    print_step "Configuring GitHub SSH access..."

    # Add GitHub to known hosts if not already present
    if ! grep -q "github.com" ~/.ssh/known_hosts 2>/dev/null; then
        mkdir -p ~/.ssh
        ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
        print_info "Added GitHub to known hosts ✓"
    else
        print_info "GitHub already in known hosts ✓"
    fi

    # Check if SSH key exists
    if [ ! -f ~/.ssh/id_ed25519 ] && [ ! -f ~/.ssh/id_rsa ]; then
        print_warning "No SSH key found. You'll need to add a deploy key to GitHub."
        print_info "Generate one with: ssh-keygen -t ed25519 -C 'deploy@$DOMAIN'"
    fi
}

clone_or_update_repo() {
    print_step "Setting up repository..."

    if [ -d "$APP_DIR" ]; then
        print_info "Repository exists, updating..."
        cd "$APP_DIR"

        # Stash any local changes
        git stash -u 2>/dev/null || true

        # Fetch latest changes
        git fetch origin

        # Checkout branch
        git checkout "$BRANCH"

        # Pull latest changes
        git pull origin "$BRANCH"

        print_info "Repository updated to latest commit: $(git rev-parse --short HEAD) ✓"
    else
        print_info "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
        git checkout "$BRANCH"
        print_info "Repository cloned ✓"
    fi
}

create_env_file() {
    print_step "Creating environment configuration..."

    cat > "$APP_DIR/.env.local" <<EOF
# OpenAI Configuration
OPENAI_API_KEY=$OPENAI_API_KEY

# Reddit API Configuration
REDDIT_CLIENT_ID=$REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET=$REDDIT_CLIENT_SECRET

# Node Environment
NODE_ENV=$NODE_ENV
PORT=$PORT
EOF

    chmod 600 "$APP_DIR/.env.local"
    print_info "Environment file created ✓"
}

install_dependencies() {
    print_step "Installing dependencies..."

    cd "$APP_DIR"

    # Clean install for production
    npm ci --production=false

    print_info "Dependencies installed ✓"
}

build_application() {
    print_step "Building application..."

    cd "$APP_DIR"

    # Build Next.js application
    npm run build

    print_info "Build completed ✓"
}

create_pm2_config() {
    print_step "Creating PM2 configuration..."

    cat > "$APP_DIR/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: '$NODE_ENV',
      PORT: $PORT
    },
    error_file: '$HOME/logs/$APP_NAME-error.log',
    out_file: '$HOME/logs/$APP_NAME-out.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

    print_info "PM2 configuration created ✓"
}

setup_nginx() {
    print_step "Configuring Nginx..."

    NGINX_CONFIG="/tmp/nginx-$APP_NAME.conf"

    cat > "$NGINX_CONFIG" <<EOF
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=general_${APP_NAME}:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=api_${APP_NAME}:10m rate=30r/s;

# Upstream for Next.js
upstream nextjs_${APP_NAME} {
    server localhost:$PORT;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Access logs
    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log /var/log/nginx/$DOMAIN.error.log;

    # Client body size limit
    client_max_body_size 10M;

    # Rate limiting
    limit_req zone=general_${APP_NAME} burst=20 nodelay;

    location / {
        proxy_pass http://nextjs_${APP_NAME};
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Cache control
        proxy_cache_bypass \$http_upgrade;
    }

    # API routes with higher rate limit
    location /api/ {
        limit_req zone=api_${APP_NAME} burst=50 nodelay;

        proxy_pass http://nextjs_${APP_NAME};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Longer timeout for API calls
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://nextjs_${APP_NAME};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;

        # Cache static assets
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Favicon and robots.txt
    location = /favicon.ico {
        proxy_pass http://nextjs_${APP_NAME};
        access_log off;
    }

    location = /robots.txt {
        proxy_pass http://nextjs_${APP_NAME};
        access_log off;
    }
}
EOF

    # Copy to nginx sites-available
    sudo cp "$NGINX_CONFIG" "/etc/nginx/sites-available/$DOMAIN"

    # Create symlink to sites-enabled if it doesn't exist
    if [ ! -L "/etc/nginx/sites-enabled/$DOMAIN" ]; then
        sudo ln -s "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/"
    fi

    # Test nginx configuration
    if sudo nginx -t; then
        print_info "Nginx configuration is valid ✓"
        sudo systemctl reload nginx
        print_info "Nginx reloaded ✓"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

setup_ssl() {
    print_step "Setting up SSL certificate..."

    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_warning "Certbot not installed, skipping SSL setup"
        print_info "Install with: sudo apt install certbot python3-certbot-nginx"
        return 0
    fi

    # Check if certificate already exists
    if sudo certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
        print_info "SSL certificate already exists ✓"
    else
        print_info "Obtaining SSL certificate..."
        print_warning "This requires your domain to be pointing to this server"

        # Attempt to get certificate (non-interactive)
        if sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
            print_info "SSL certificate obtained ✓"
        else
            print_warning "SSL certificate setup failed (likely DNS not configured yet)"
            print_info "Run this manually after DNS is set up:"
            print_info "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
        fi
    fi
}

start_application() {
    print_step "Starting application with PM2..."

    cd "$APP_DIR"

    # Check if app is already running
    if pm2 describe "$APP_NAME" &>/dev/null; then
        print_info "Restarting existing application..."
        pm2 restart "$APP_NAME"
    else
        print_info "Starting new application..."
        pm2 start ecosystem.config.js
    fi

    # Save PM2 process list
    pm2 save

    # Setup PM2 startup script if not already configured
    if ! sudo systemctl is-enabled pm2-deploy &>/dev/null; then
        print_info "Configuring PM2 startup script..."
        sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
    fi

    print_info "Application started ✓"
}

show_status() {
    print_step "Deployment Status"

    echo ""
    pm2 status

    echo ""
    print_info "Application logs:"
    pm2 logs "$APP_NAME" --lines 20 --nostream

    echo ""
    print_info "Deployment completed successfully! ✓"
    echo ""
    print_info "Your application is running at:"
    print_info "  http://$DOMAIN"

    if sudo certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
        print_info "  https://$DOMAIN"
    fi

    echo ""
}

create_backup() {
    print_step "Creating backup..."

    BACKUP_DIR="$HOME/backups"
    DATE=$(date +%Y%m%d_%H%M%S)

    if [ -d "$APP_DIR" ]; then
        tar -czf "$BACKUP_DIR/${APP_NAME}_${DATE}.tar.gz" \
            --exclude='node_modules' \
            --exclude='.next' \
            -C "$HOME/apps" "$(basename $APP_DIR)"

        print_info "Backup created: ${APP_NAME}_${DATE}.tar.gz ✓"

        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t ${APP_NAME}_*.tar.gz | tail -n +6 | xargs -r rm
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo "================================================================================"
    echo "Deploying $APP_NAME"
    echo "================================================================================"
    echo ""

    check_required_env
    setup_directories
    setup_ssh_github
    create_backup
    clone_or_update_repo
    create_env_file
    install_dependencies
    build_application
    create_pm2_config
    setup_nginx
    setup_ssl
    start_application
    show_status
}

main
