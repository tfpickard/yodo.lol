" Vim configuration for improved quality of life

" General Settings
set nocompatible              " Disable vi compatibility
filetype plugin indent on     " Enable file type detection
syntax on                     " Enable syntax highlighting

" Interface
set number                    " Show line numbers
set relativenumber            " Show relative line numbers
set ruler                     " Show cursor position
set showcmd                   " Show command in bottom bar
set wildmenu                  " Visual autocomplete for command menu
set showmatch                 " Highlight matching brackets
set laststatus=2              " Always show status line
set cursorline                " Highlight current line
set colorcolumn=80            " Show column at 80 characters

" Search Settings
set incsearch                 " Search as characters are entered
set hlsearch                  " Highlight search matches
set ignorecase                " Ignore case when searching
set smartcase                 " Override ignorecase if search contains uppercase

" Indentation
set autoindent                " Copy indent from current line
set smartindent               " Smart auto-indenting
set expandtab                 " Use spaces instead of tabs
set tabstop=4                 " Number of spaces per tab
set shiftwidth=4              " Number of spaces for auto-indent
set softtabstop=4             " Number of spaces in tab when editing

" File-specific indentation
autocmd FileType javascript,typescript,json,yaml,html,css setlocal ts=2 sw=2 sts=2
autocmd FileType python setlocal ts=4 sw=4 sts=4
autocmd FileType go setlocal ts=4 sw=4 sts=4 noexpandtab

" Performance
set lazyredraw                " Don't redraw while executing macros
set ttyfast                   " Faster redrawing

" Editing
set backspace=indent,eol,start " Make backspace work as expected
set encoding=utf-8            " Set encoding to UTF-8
set clipboard=unnamed         " Use system clipboard
set mouse=a                   " Enable mouse support

" Undo and Backup
set undolevels=1000           " Number of undo levels
set nobackup                  " Don't create backup files
set noswapfile                " Don't create swap files
set undofile                  " Maintain undo history between sessions
set undodir=~/.vim/undodir    " Directory for undo files

" Create undo directory if it doesn't exist
if !isdirectory($HOME."/.vim/undodir")
    call mkdir($HOME."/.vim/undodir", "p", 0700)
endif

" Folding
set foldenable                " Enable folding
set foldlevelstart=10         " Open most folds by default
set foldnestmax=10            " Maximum nested folds
set foldmethod=indent         " Fold based on indent level

" Status Line
set statusline=%F%m%r%h%w     " Full path, modified flag, readonly flag
set statusline+=\ [%{&ff}]    " File format
set statusline+=\ [%Y]        " File type
set statusline+=%=            " Left/right separator
set statusline+=%c,           " Cursor column
set statusline+=%l/%L         " Cursor line/total lines
set statusline+=\ %P          " Percent through file

" Key Mappings
let mapleader = ","           " Set leader key to comma

" Clear search highlighting
nnoremap <leader><space> :nohlsearch<CR>

" Quick save and quit
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>
nnoremap <leader>x :x<CR>

" Navigate between windows
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" Move lines up and down
nnoremap <A-j> :m .+1<CR>==
nnoremap <A-k> :m .-2<CR>==
vnoremap <A-j> :m '>+1<CR>gv=gv
vnoremap <A-k> :m '<-2<CR>gv=gv

" Better indenting in visual mode
vnoremap < <gv
vnoremap > >gv

" Toggle paste mode
set pastetoggle=<F2>

" Toggle line numbers
nnoremap <leader>n :set number! relativenumber!<CR>

" Split window shortcuts
nnoremap <leader>v :vsplit<CR>
nnoremap <leader>h :split<CR>

" Buffer navigation
nnoremap <leader>bn :bnext<CR>
nnoremap <leader>bp :bprevious<CR>
nnoremap <leader>bd :bdelete<CR>

" Tab navigation
nnoremap <leader>tn :tabnew<CR>
nnoremap <leader>tc :tabclose<CR>
nnoremap <leader>tm :tabmove<CR>

" File navigation
nnoremap <leader>e :e<space>
nnoremap <leader>f :find<space>

" Trim trailing whitespace
nnoremap <leader>tw :%s/\s\+$//e<CR>

" Auto Commands
" Return to last edit position when opening files
autocmd BufReadPost *
     \ if line("'\"") > 0 && line("'\"") <= line("$") |
     \   exe "normal! g`\"" |
     \ endif

" Remove trailing whitespace on save for specific file types
autocmd BufWritePre *.py,*.js,*.ts,*.jsx,*.tsx,*.go,*.rs :%s/\s\+$//e

" Highlight TODO, FIXME, NOTE, etc.
autocmd Syntax * call matchadd('Todo', '\W\zs\(TODO\|FIXME\|CHANGED\|XXX\|BUG\|HACK\|NOTE\)')

" Color Scheme
set background=dark
if has('termguicolors')
    set termguicolors
endif

" Try to use a better color scheme if available, fall back to default
try
    colorscheme desert
catch
    " Fallback to default if scheme not found
endtry

" File Type Settings
autocmd FileType markdown setlocal wrap linebreak
autocmd FileType gitcommit setlocal spell
autocmd FileType text setlocal wrap linebreak

" Performance optimizations for large files
autocmd BufReadPre *
    \ if getfsize(expand("%")) > 10000000 |
    \   syntax off |
    \   set foldmethod=manual |
    \ endif

" Netrw (built-in file explorer) settings
let g:netrw_banner = 0        " Disable banner
let g:netrw_liststyle = 3     " Tree view
let g:netrw_winsize = 25      " Window size

" Open netrw with leader-e
nnoremap <leader>E :Lexplore<CR>

" Plugin management with vim-plug
" Install vim-plug with:
" curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
"     https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

" Uncomment and customize the following section if you want to use plugins
" call plug#begin('~/.vim/plugged')
"
" " File navigation
" Plug 'preservim/nerdtree'
" Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
" Plug 'junegunn/fzf.vim'
"
" " Git integration
" Plug 'tpope/vim-fugitive'
" Plug 'airblade/vim-gitgutter'
"
" " Code completion and linting
" Plug 'neoclide/coc.nvim', {'branch': 'release'}
"
" " Syntax and language support
" Plug 'sheerun/vim-polyglot'
"
" " Color schemes
" Plug 'morhetz/gruvbox'
" Plug 'joshdick/onedark.vim'
"
" " Status line
" Plug 'vim-airline/vim-airline'
" Plug 'vim-airline/vim-airline-themes'
"
" " Commenting
" Plug 'tpope/vim-commentary'
"
" " Auto pairs
" Plug 'jiangmiao/auto-pairs'
"
" call plug#end()
