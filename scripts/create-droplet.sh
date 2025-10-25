#!/bin/bash

################################################################################
# DigitalOcean Droplet Creation Script
#
# This script automates the creation and initial setup of a DigitalOcean droplet
# for hosting Next.js applications with Nginx, PM2, and SSL.
#
# Prerequisites:
# - DigitalOcean API token (export DO_API_TOKEN=your_token)
# - SSH public key uploaded to DigitalOcean account
# - jq installed (for JSON parsing)
#
# Usage:
#   export DO_API_TOKEN="your_digitalocean_api_token"
#   ./scripts/create-droplet.sh
#
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DROPLET_NAME="${DROPLET_NAME:-yodo-lol-prod}"
REGION="${REGION:-nyc1}"
SIZE="${SIZE:-s-1vcpu-2gb}"
IMAGE="${IMAGE:-ubuntu-22-04-x64}"
SSH_KEY_NAME="${SSH_KEY_NAME:-}"  # Will auto-detect if not set

# DigitalOcean API endpoint
API_URL="https://api.digitalocean.com/v2"

################################################################################
# Helper Functions
################################################################################

print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Install it with: sudo apt install jq (Ubuntu/Debian) or brew install jq (macOS)"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        exit 1
    fi

    if [ -z "$DO_API_TOKEN" ]; then
        print_error "DO_API_TOKEN environment variable is not set"
        echo "Get your API token from: https://cloud.digitalocean.com/account/api/tokens"
        echo "Then run: export DO_API_TOKEN='your_token_here'"
        exit 1
    fi

    print_status "All dependencies satisfied ✓"
}

get_ssh_keys() {
    print_status "Fetching SSH keys from your DigitalOcean account..."

    RESPONSE=$(curl -s -X GET \
        -H "Authorization: Bearer $DO_API_TOKEN" \
        -H "Content-Type: application/json" \
        "$API_URL/account/keys")

    SSH_KEYS=$(echo "$RESPONSE" | jq -r '.ssh_keys')

    if [ "$SSH_KEYS" == "null" ] || [ -z "$SSH_KEYS" ]; then
        print_error "No SSH keys found in your DigitalOcean account"
        echo "Add an SSH key at: https://cloud.digitalocean.com/account/security"
        exit 1
    fi

    # Display available SSH keys
    echo ""
    echo "Available SSH keys:"
    echo "$RESPONSE" | jq -r '.ssh_keys[] | "\(.id): \(.name)"'
    echo ""

    # Auto-select first key if not specified
    if [ -z "$SSH_KEY_NAME" ]; then
        SSH_KEY_ID=$(echo "$RESPONSE" | jq -r '.ssh_keys[0].id')
        SSH_KEY_NAME=$(echo "$RESPONSE" | jq -r '.ssh_keys[0].name')
        print_status "Auto-selected SSH key: $SSH_KEY_NAME (ID: $SSH_KEY_ID)"
    else
        SSH_KEY_ID=$(echo "$RESPONSE" | jq -r ".ssh_keys[] | select(.name==\"$SSH_KEY_NAME\") | .id")
        if [ -z "$SSH_KEY_ID" ]; then
            print_error "SSH key '$SSH_KEY_NAME' not found"
            exit 1
        fi
        print_status "Using SSH key: $SSH_KEY_NAME (ID: $SSH_KEY_ID)"
    fi
}

check_existing_droplet() {
    print_status "Checking for existing droplet with name '$DROPLET_NAME'..."

    EXISTING=$(curl -s -X GET \
        -H "Authorization: Bearer $DO_API_TOKEN" \
        "$API_URL/droplets" | jq -r ".droplets[] | select(.name==\"$DROPLET_NAME\") | .id")

    if [ -n "$EXISTING" ]; then
        print_warning "Droplet '$DROPLET_NAME' already exists (ID: $EXISTING)"
        read -p "Do you want to destroy it and create a new one? (yes/no): " -r
        if [[ $REPLY =~ ^[Yy]es$ ]]; then
            print_status "Destroying existing droplet..."
            curl -s -X DELETE \
                -H "Authorization: Bearer $DO_API_TOKEN" \
                "$API_URL/droplets/$EXISTING"
            print_status "Waiting 10 seconds for cleanup..."
            sleep 10
        else
            print_error "Aborted. Choose a different DROPLET_NAME or destroy the existing droplet manually."
            exit 1
        fi
    fi
}

create_cloud_init() {
    print_status "Generating cloud-init configuration..."

    cat > /tmp/cloud-init.yml <<'EOF'
#cloud-config

users:
  - name: deploy
    groups: sudo
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    ssh_authorized_keys:
      - SSH_KEY_PLACEHOLDER

package_update: true
package_upgrade: true

packages:
  - curl
  - git
  - nginx
  - ufw
  - fail2ban
  - htop
  - build-essential
  - certbot
  - python3-certbot-nginx

runcmd:
  # Configure UFW firewall
  - ufw allow 22/tcp
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw --force enable

  # Install Node.js 20.x
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs

  # Install PM2 globally
  - npm install -g pm2

  # Configure fail2ban for SSH
  - systemctl enable fail2ban
  - systemctl start fail2ban

  # Configure Nginx
  - systemctl enable nginx
  - systemctl start nginx

  # Create app directories
  - mkdir -p /home/deploy/apps
  - mkdir -p /home/deploy/logs
  - mkdir -p /home/deploy/backups
  - chown -R deploy:deploy /home/deploy

  # Harden SSH
  - sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
  - sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  - systemctl restart sshd

  # Setup log rotation
  - |
    cat > /etc/logrotate.d/pm2-apps <<LOGROTATE
    /home/deploy/logs/*.log {
        daily
        missingok
        rotate 7
        compress
        delaycompress
        notifempty
        create 0640 deploy deploy
    }
    LOGROTATE

  # Enable automatic security updates
  - apt-get install -y unattended-upgrades
  - dpkg-reconfigure -plow unattended-upgrades

final_message: "DigitalOcean droplet setup complete! The system is ready for deployment."
EOF

    # Note: SSH key will be added by DigitalOcean automatically
    print_status "Cloud-init configuration created ✓"
}

create_droplet() {
    print_status "Creating droplet '$DROPLET_NAME'..."

    create_cloud_init

    USER_DATA=$(cat /tmp/cloud-init.yml)

    RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $DO_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d @- "$API_URL/droplets" <<EOF
{
    "name": "$DROPLET_NAME",
    "region": "$REGION",
    "size": "$SIZE",
    "image": "$IMAGE",
    "ssh_keys": [$SSH_KEY_ID],
    "backups": false,
    "ipv6": true,
    "monitoring": true,
    "tags": ["nextjs", "production", "yodo-lol"],
    "user_data": $(echo "$USER_DATA" | jq -Rs .)
}
EOF
    )

    DROPLET_ID=$(echo "$RESPONSE" | jq -r '.droplet.id')

    if [ "$DROPLET_ID" == "null" ] || [ -z "$DROPLET_ID" ]; then
        print_error "Failed to create droplet"
        echo "$RESPONSE" | jq '.'
        exit 1
    fi

    print_status "Droplet created! ID: $DROPLET_ID"
    echo ""
}

wait_for_droplet() {
    print_status "Waiting for droplet to become active..."

    while true; do
        STATUS=$(curl -s -X GET \
            -H "Authorization: Bearer $DO_API_TOKEN" \
            "$API_URL/droplets/$DROPLET_ID" | jq -r '.droplet.status')

        if [ "$STATUS" == "active" ]; then
            break
        fi

        echo -n "."
        sleep 3
    done

    echo ""
    print_status "Droplet is active! ✓"
}

get_droplet_ip() {
    print_status "Retrieving droplet IP address..."

    DROPLET_IP=$(curl -s -X GET \
        -H "Authorization: Bearer $DO_API_TOKEN" \
        "$API_URL/droplets/$DROPLET_ID" | jq -r '.droplet.networks.v4[] | select(.type=="public") | .ip_address')

    if [ -z "$DROPLET_IP" ]; then
        print_error "Failed to get droplet IP"
        exit 1
    fi

    print_status "Droplet IP: $DROPLET_IP"
}

wait_for_cloud_init() {
    print_status "Waiting for cloud-init to complete (this may take 3-5 minutes)..."
    echo "This process installs Node.js, Nginx, PM2, and configures security settings."
    echo ""

    MAX_ATTEMPTS=60
    ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 deploy@$DROPLET_IP "test -f /var/lib/cloud/instance/boot-finished" 2>/dev/null; then
            echo ""
            print_status "Cloud-init completed! ✓"
            return 0
        fi

        echo -n "."
        sleep 5
        ATTEMPT=$((ATTEMPT + 1))
    done

    echo ""
    print_warning "Cloud-init is taking longer than expected, but the droplet is accessible."
    print_status "You can continue with deployment or wait and check manually."
}

create_firewall() {
    print_status "Creating DigitalOcean Cloud Firewall..."

    FIREWALL_RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $DO_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d @- "$API_URL/firewalls" <<EOF
{
    "name": "${DROPLET_NAME}-firewall",
    "inbound_rules": [
        {
            "protocol": "tcp",
            "ports": "22",
            "sources": {
                "addresses": ["0.0.0.0/0", "::/0"]
            }
        },
        {
            "protocol": "tcp",
            "ports": "80",
            "sources": {
                "addresses": ["0.0.0.0/0", "::/0"]
            }
        },
        {
            "protocol": "tcp",
            "ports": "443",
            "sources": {
                "addresses": ["0.0.0.0/0", "::/0"]
            }
        }
    ],
    "outbound_rules": [
        {
            "protocol": "tcp",
            "ports": "all",
            "destinations": {
                "addresses": ["0.0.0.0/0", "::/0"]
            }
        },
        {
            "protocol": "udp",
            "ports": "all",
            "destinations": {
                "addresses": ["0.0.0.0/0", "::/0"]
            }
        },
        {
            "protocol": "icmp",
            "destinations": {
                "addresses": ["0.0.0.0/0", "::/0"]
            }
        }
    ],
    "droplet_ids": [$DROPLET_ID]
}
EOF
    )

    FIREWALL_ID=$(echo "$FIREWALL_RESPONSE" | jq -r '.firewall.id')

    if [ "$FIREWALL_ID" != "null" ] && [ -n "$FIREWALL_ID" ]; then
        print_status "Cloud Firewall created! ID: $FIREWALL_ID ✓"
    else
        print_warning "Could not create cloud firewall (UFW is still configured on the droplet)"
    fi
}

print_summary() {
    echo ""
    echo "================================================================================"
    echo -e "${GREEN}Droplet Created Successfully!${NC}"
    echo "================================================================================"
    echo ""
    echo "Droplet Details:"
    echo "  Name:       $DROPLET_NAME"
    echo "  ID:         $DROPLET_ID"
    echo "  IP Address: $DROPLET_IP"
    echo "  Region:     $REGION"
    echo "  Size:       $SIZE"
    echo "  Image:      $IMAGE"
    echo ""
    echo "Next Steps:"
    echo ""
    echo "1. Configure DNS A records for your domain(s):"
    echo "   Type: A    Host: @      Value: $DROPLET_IP"
    echo "   Type: A    Host: www    Value: $DROPLET_IP"
    echo ""
    echo "2. Set up GitHub secrets (see AUTOMATED_DEPLOYMENT.md)"
    echo ""
    echo "3. SSH into your droplet:"
    echo "   ssh deploy@$DROPLET_IP"
    echo ""
    echo "4. To manually deploy the application:"
    echo "   scp scripts/deploy.sh deploy@$DROPLET_IP:~/"
    echo "   ssh deploy@$DROPLET_IP 'bash ~/deploy.sh'"
    echo ""
    echo "5. Or push to main branch to trigger automatic deployment via GitHub Actions"
    echo ""
    echo "Monitoring:"
    echo "  DigitalOcean Dashboard: https://cloud.digitalocean.com/droplets/$DROPLET_ID"
    echo ""
    echo "================================================================================"
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo "================================================================================"
    echo "DigitalOcean Droplet Creation Script"
    echo "================================================================================"
    echo ""

    check_dependencies
    get_ssh_keys
    check_existing_droplet
    create_droplet
    wait_for_droplet
    get_droplet_ip
    create_firewall
    wait_for_cloud_init
    print_summary
}

main
