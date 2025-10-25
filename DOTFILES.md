# Dotfiles Configuration

This repository includes a comprehensive set of dotfiles for improved quality of life on servers and development environments.

## What's Included

### Shell Configuration (.zshrc)
- **Oh My Zsh** framework with useful plugins
- **Vi mode** enabled with optimized key bindings
- **FZF (Fuzzy Finder)** integration for blazing-fast file/directory/history search
- **Plugins enabled**:
  - vi-mode (vim keybindings in terminal)
  - git
  - docker & docker-compose
  - npm, node, yarn
  - pm2 (process manager)
  - fzf (fuzzy finder integration)
  - sudo
  - history
  - command-not-found
  - colored-man-pages
  - zsh-autosuggestions
  - zsh-syntax-highlighting
- **Quality of life aliases** for common operations
- **Enhanced history** with deduplication and sharing
- **Better directory navigation** with auto-cd and pushd
- **Custom key bindings** for improved efficiency
- **Custom fuzzy search functions** (fe, fcd, fkill, fgb, fglog)

### Tmux Configuration (.tmux.conf)
- **Custom prefix**: `Ctrl-a` instead of `Ctrl-b`
- **Intuitive pane splitting**: `|` for vertical, `-` for horizontal
- **Mouse support** enabled
- **Vim-like navigation** for panes and copy mode
- **Status bar** with system load and time
- **Plugin support** via TPM (Tmux Plugin Manager)
- **Session persistence** with tmux-resurrect and tmux-continuum

### Vim Configuration (.vimrc)
- **Modern interface** with line numbers and syntax highlighting
- **Smart indentation** with file-type specific settings
- **Enhanced search** with highlighting and smart case
- **Quality of life mappings** for common operations
- **Undo persistence** across sessions
- **Status line** with file info
- **Plugin-ready** with vim-plug (commented out by default)

### Git Configuration (.gitconfig)
- **Comprehensive aliases** for common git operations
- **Better diffs** with color configuration
- **Auto-prune** on fetch
- **Sensible defaults** for push, pull, and merge
- **Support for local customization** via .gitconfig.local

## Quick Start

### Automatic Installation

Run the setup script to automatically install and configure everything:

```bash
./setup-dotfiles.sh
```

This script will:
1. Install essential packages (zsh, tmux, vim, git, etc.)
2. Install Oh My Zsh and plugins (autosuggestions, syntax-highlighting)
3. Install FZF (fuzzy finder) with key bindings
4. Install optional tools (fd, ripgrep, bat, ag) for enhanced fuzzy search
5. Install Tmux Plugin Manager (TPM)
6. Install vim-plug for Vim
7. Create symbolic links to dotfiles
8. Change your default shell to zsh

### Manual Installation

If you prefer to install manually:

1. **Install dependencies**:
   ```bash
   sudo apt-get update
   sudo apt-get install zsh tmux vim git curl wget
   ```

2. **Install Oh My Zsh**:
   ```bash
   sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
   ```

3. **Install Zsh plugins**:
   ```bash
   git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
   git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
   ```

4. **Install FZF and optional tools**:
   ```bash
   # Install FZF
   git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
   ~/.fzf/install --key-bindings --completion --no-update-rc

   # Install optional tools for better fuzzy search
   sudo apt-get install fd-find ripgrep bat silversearcher-ag

   # Create symlinks for Debian/Ubuntu package names
   mkdir -p ~/.local/bin
   ln -sf $(which fdfind) ~/.local/bin/fd
   ln -sf $(which batcat) ~/.local/bin/bat
   ```

5. **Install Tmux Plugin Manager**:
   ```bash
   git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
   ```

6. **Create symbolic links**:
   ```bash
   ln -s $(pwd)/.zshrc ~/.zshrc
   ln -s $(pwd)/.tmux.conf ~/.tmux.conf
   ln -s $(pwd)/.vimrc ~/.vimrc
   ln -s $(pwd)/.gitconfig ~/.gitconfig
   ```

7. **Change default shell**:
   ```bash
   chsh -s $(which zsh)
   ```

## Post-Installation

### Configure Git User Info

Create `~/.gitconfig.local` with your user information:

```ini
[user]
    name = Your Name
    email = your.email@example.com
```

### Install Tmux Plugins

1. Start tmux: `tmux`
2. Press `Ctrl-a` + `I` (capital I) to install plugins

### Install Vim Plugins (Optional)

1. Edit `.vimrc` and uncomment the plugin section
2. Open vim and run `:PlugInstall`

### Reload Configuration

After installation:
- Zsh: `exec zsh` or log out and back in
- Tmux: Press `Ctrl-a` + `r` to reload
- Vim: `:source ~/.vimrc`

## Key Features

### Zsh Aliases

#### Navigation
- `ll`, `la`, `l` - Enhanced ls commands
- `..`, `...`, `....` - Quick directory navigation

#### Git
- `gs` - git status
- `ga` - git add
- `gc` - git commit
- `gp` - git push
- `gl` - pretty git log

#### Docker
- `d` - docker
- `dc` - docker-compose
- `dps` - docker ps
- `dexec` - docker exec -it

#### Tmux
- `ta` - tmux attach
- `ts` - tmux new session
- `tl` - tmux list sessions

### Vi Mode

Vi mode is enabled in zsh, providing vim-like keybindings:

**Insert Mode** (default):
- Type normally as you would in any shell
- Press `ESC` to enter command mode

**Command Mode**:
- `h/j/k/l` - Move cursor left/down/up/right
- `w/b` - Move forward/backward by word
- `0/$` - Move to beginning/end of line
- `i/a` - Enter insert mode before/after cursor
- `I/A` - Enter insert mode at beginning/end of line
- `dd` - Delete entire line
- `cc` - Change entire line
- `/` - Search forward in history
- `?` - Search backward in history
- `v` - Edit command in $EDITOR (vim)

**Universal Keybindings** (work in both modes):
- `Ctrl-R` - Fuzzy search history with FZF
- `Ctrl-P/N` - Previous/next command in history
- `Ctrl-W` - Delete word backward
- `Ctrl-H` - Backspace

### FZF Fuzzy Search

FZF provides powerful fuzzy finding capabilities:

**Default Key Bindings**:
- `Ctrl-R` - Fuzzy search command history
- `Ctrl-T` - Fuzzy search files in current directory tree
- `Alt-C` - Fuzzy search directories and cd into selected

**Custom Functions**:
- `fe [query]` - Fuzzy find and edit files in $EDITOR
- `fcd [path]` - Fuzzy find and cd into directory
- `fkill` - Fuzzy search and kill processes
- `fgb` - Fuzzy search and checkout git branches
- `fglog` - Interactive fuzzy git log browser

**FZF Navigation** (inside FZF interface):
- `Ctrl-J/K` or arrow keys - Move selection up/down
- `Enter` - Select item
- `Tab` - Multi-select (when available)
- `Ctrl-A` - Select all
- `?` - Toggle preview window
- `Ctrl-/` - Toggle preview window position

**Fuzzy Completion**:
Type `**` and press `Tab` for fuzzy completion:
- `vim **<Tab>` - Fuzzy find files to edit
- `cd **<Tab>` - Fuzzy find directories to cd
- `kill -9 **<Tab>` - Fuzzy find processes to kill
- `ssh **<Tab>` - Fuzzy find from ssh known hosts

### Tmux Key Bindings

- `Ctrl-a` - Prefix key
- `Ctrl-a |` - Split vertically
- `Ctrl-a -` - Split horizontally
- `Ctrl-a r` - Reload config
- `Ctrl-a h/j/k/l` - Navigate panes (vim-like)
- `Ctrl-a H/J/K/L` - Resize panes
- `Ctrl-a [` - Enter copy mode (use vim keys)

### Vim Key Mappings

- `,` - Leader key
- `,w` - Save file
- `,q` - Quit
- `,<space>` - Clear search highlight
- `,v` - Vertical split
- `,h` - Horizontal split
- `Ctrl-h/j/k/l` - Navigate windows

### Git Aliases

- `git l` - Pretty oneline log
- `git lg` - Detailed graph log
- `git aa` - Add all files
- `git unstage` - Unstage files
- `git undo` - Undo last commit (keep changes)
- `git aliases` - List all git aliases

## Customization

### Local Customizations

You can create local customization files that won't be tracked:

- `~/.zshrc.local` - Local zsh customizations
- `~/.gitconfig.local` - Local git configuration

These files are automatically loaded if they exist.

### Modifying Dotfiles

To modify the dotfiles:

1. Edit the files in this repository
2. The changes will be immediately available (symlinks)
3. Reload the configuration:
   - Zsh: `reload` alias or `source ~/.zshrc`
   - Tmux: `Ctrl-a r`
   - Vim: `:source ~/.vimrc`

## Troubleshooting

### Zsh Plugins Not Working

Make sure the plugins are installed:
```bash
ls ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/
```

### Tmux Plugins Not Loading

1. Make sure TPM is installed: `ls ~/.tmux/plugins/tpm`
2. Install plugins: `Ctrl-a I` (capital I)
3. Reload tmux: `Ctrl-a r`

### Vim Undo History Issues

Make sure the undo directory exists:
```bash
mkdir -p ~/.vim/undodir
```

### Permission Issues

If you get permission errors:
```bash
chmod +x setup-dotfiles.sh
```

## Uninstallation

To remove the dotfiles:

1. Remove symlinks:
   ```bash
   rm ~/.zshrc ~/.tmux.conf ~/.vimrc ~/.gitconfig
   ```

2. Restore backups (if they exist):
   ```bash
   mv ~/.zshrc.backup.* ~/.zshrc
   mv ~/.tmux.conf.backup.* ~/.tmux.conf
   # etc.
   ```

3. Change shell back to bash:
   ```bash
   chsh -s /bin/bash
   ```

## Additional Resources

- [Oh My Zsh Documentation](https://github.com/ohmyzsh/ohmyzsh/wiki)
- [Tmux Manual](https://man7.org/linux/man-pages/man1/tmux.1.html)
- [Vim Documentation](https://www.vim.org/docs.php)
- [Git Documentation](https://git-scm.com/doc)

## Contributing

Feel free to customize these dotfiles to your needs. If you find improvements, consider sharing them!

## License

These dotfiles are provided as-is for personal and professional use.
