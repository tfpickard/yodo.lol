import { DesignTheme } from './openai';

/**
 * Dynamic Theme Engine
 * Applies AI-generated themes to the page with smooth transitions
 */
export class ThemeEngine {
  /**
   * Apply theme to the page
   */
  static applyTheme(theme: DesignTheme) {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply CSS custom properties with transition
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-radius', theme.borderRadius);

    // Apply font family
    this.loadGoogleFont(theme.fontFamily);
    root.style.setProperty('--font-family', theme.fontFamily);

    // Store layout style in data attribute for components to use
    root.setAttribute('data-layout', theme.layoutStyle);
    root.setAttribute('data-animation', theme.animation);
  }

  /**
   * Load Google Font dynamically
   */
  static loadGoogleFont(fontName: string) {
    if (typeof window === 'undefined') return;

    // Skip if it's a web-safe font
    const webSafeFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact'];
    if (webSafeFonts.includes(fontName)) return;

    // Check if font is already loaded
    const fontId = `google-font-${fontName.replace(/\s+/g, '-')}`;
    if (document.getElementById(fontId)) return;

    // Load font from Google Fonts
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }

  /**
   * Get animation class based on theme
   */
  static getAnimationClass(animation: string): string {
    const animations: Record<string, string> = {
      subtle: 'animate-fade-in',
      bouncy: 'animate-bounce-in',
      glitchy: 'animate-glitch',
      smooth: 'animate-slide-in',
      chaotic: 'animate-chaos',
    };
    return animations[animation] || animations.subtle;
  }

  /**
   * Generate random background pattern
   */
  static generateBackgroundPattern(theme: DesignTheme): string {
    const patterns = [
      'none',
      `radial-gradient(circle at 20% 50%, ${theme.primaryColor}22 0%, transparent 50%)`,
      `linear-gradient(45deg, ${theme.primaryColor}11 25%, transparent 25%, transparent 75%, ${theme.primaryColor}11 75%)`,
      `repeating-linear-gradient(45deg, ${theme.secondaryColor}11, ${theme.secondaryColor}11 10px, transparent 10px, transparent 20px)`,
      `radial-gradient(circle, ${theme.accentColor}11 1px, transparent 1px)`,
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  }
}

/**
 * Get contrasting text color for accessibility
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
