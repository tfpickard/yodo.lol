#!/bin/bash

# Dotfiles Setup Script
# This script installs and configures dotfiles for an improved server experience

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to backup existing files
backup_file() {
    local file=$1
    if [ -f "$file" ] || [ -L "$file" ]; then
        local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Backing up existing $file to $backup"
        mv "$file" "$backup"
        print_success "Backup created: $backup"
    fi
}

# Function to create symbolic link
create_symlink() {
    local source=$1
    local target=$2

    if [ -L "$target" ]; then
        print_info "Removing existing symlink: $target"
        rm "$target"
    elif [ -f "$target" ]; then
        backup_file "$target"
    fi

    ln -s "$source" "$target"
    print_success "Created symlink: $target -> $source"
}

print_info "Starting dotfiles setup..."

# Get the directory where the script is located
DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
print_info "Dotfiles directory: $DOTFILES_DIR"

# Update package list
print_info "Updating package list..."
sudo apt-get update -qq

# Install essential packages
print_info "Installing essential packages..."
PACKAGES=(
    "zsh"
    "tmux"
    "vim"
    "git"
    "curl"
    "wget"
    "htop"
    "tree"
    "build-essential"
)

for package in "${PACKAGES[@]}"; do
    if ! dpkg -l | grep -q "^ii  $package "; then
        print_info "Installing $package..."
        sudo apt-get install -y "$package" > /dev/null 2>&1
        print_success "$package installed"
    else
        print_info "$package is already installed"
    fi
done

# Install Oh My Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    print_info "Installing Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
    print_success "Oh My Zsh installed"
else
    print_info "Oh My Zsh is already installed"
fi

# Install zsh-autosuggestions plugin
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
    print_info "Installing zsh-autosuggestions plugin..."
    git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions" > /dev/null 2>&1
    print_success "zsh-autosuggestions installed"
else
    print_info "zsh-autosuggestions is already installed"
fi

# Install zsh-syntax-highlighting plugin
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
    print_info "Installing zsh-syntax-highlighting plugin..."
    git clone https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" > /dev/null 2>&1
    print_success "zsh-syntax-highlighting installed"
else
    print_info "zsh-syntax-highlighting is already installed"
fi

# Install Tmux Plugin Manager (TPM)
if [ ! -d "$HOME/.tmux/plugins/tpm" ]; then
    print_info "Installing Tmux Plugin Manager (TPM)..."
    git clone https://github.com/tmux-plugins/tpm "$HOME/.tmux/plugins/tpm" > /dev/null 2>&1
    print_success "TPM installed"
else
    print_info "TPM is already installed"
fi

# Install vim-plug
if [ ! -f "$HOME/.vim/autoload/plug.vim" ]; then
    print_info "Installing vim-plug..."
    curl -fLo "$HOME/.vim/autoload/plug.vim" --create-dirs \
        https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim > /dev/null 2>&1
    print_success "vim-plug installed"
else
    print_info "vim-plug is already installed"
fi

# Create symlinks for dotfiles
print_info "Creating symlinks for dotfiles..."

# .zshrc
if [ -f "$DOTFILES_DIR/.zshrc" ]; then
    create_symlink "$DOTFILES_DIR/.zshrc" "$HOME/.zshrc"
fi

# .tmux.conf
if [ -f "$DOTFILES_DIR/.tmux.conf" ]; then
    create_symlink "$DOTFILES_DIR/.tmux.conf" "$HOME/.tmux.conf"
fi

# .vimrc
if [ -f "$DOTFILES_DIR/.vimrc" ]; then
    create_symlink "$DOTFILES_DIR/.vimrc" "$HOME/.vimrc"
fi

# .gitconfig
if [ -f "$DOTFILES_DIR/.gitconfig" ]; then
    create_symlink "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
    print_warning "Don't forget to set your name and email in ~/.gitconfig.local"
    print_info "Example:"
    echo "  [user]"
    echo "    name = Your Name"
    echo "    email = your.email@example.com"
fi

# Change default shell to zsh
if [ "$SHELL" != "$(which zsh)" ]; then
    print_info "Changing default shell to zsh..."
    chsh -s "$(which zsh)"
    print_success "Default shell changed to zsh (will take effect on next login)"
else
    print_info "Default shell is already zsh"
fi

# Install tmux plugins
print_info "Installing tmux plugins..."
if [ -d "$HOME/.tmux/plugins/tpm" ]; then
    "$HOME/.tmux/plugins/tpm/bin/install_plugins" > /dev/null 2>&1
    print_success "Tmux plugins installed"
fi

print_success "Dotfiles setup complete!"
echo ""
print_info "Next steps:"
echo "  1. Log out and log back in (or run 'exec zsh') to start using zsh"
echo "  2. Configure your git user info in ~/.gitconfig.local"
echo "  3. Start tmux and press prefix + I (Ctrl-a + Shift-i) to install tmux plugins"
echo "  4. Open vim and run :PlugInstall if you enabled plugins in .vimrc"
echo ""
print_info "Enjoy your new setup!"
