import { ThemeSettings } from '../types';

export const defaultThemeSettings: ThemeSettings = {
  primaryColor: '#246BFD',       // Cobalt Blue
  secondaryColor: '#101828',     // Charcoal
  accentColor: '#36D6E7',        // Cyan
  pageBgColor: '#F8FAFC',        // Clean Light Neutral
  cardBgColor: '#FFFFFF',        // Pure White Surface
  textPrimaryColor: '#101828',   // Strong Dark Charcoal
  textSecondaryColor: '#667085', // Balanced Muted Neutral
  btnTextColor: '#FFFFFF',       // Crisp White Button Text
};

/**
 * Validates whether a given string is a valid 3 or 6 digit hex color code.
 */
export function isValidHex(hex: string): boolean {
  if (!hex) return false;
  const clean = hex.trim();
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(clean);
}

/**
 * Ensures a hex string starts with '#' and trims whitespace.
 */
export function normalizeHex(input: string, fallback: string): string {
  if (!input) return fallback;
  let clean = input.trim();
  if (!clean.startsWith('#')) clean = `#${clean}`;
  return isValidHex(clean) ? clean.toUpperCase() : fallback;
}

/**
 * Adjusts brightness of a HEX color by a given percentage (-100 to 100).
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return hex;

  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;

  const num = parseInt(full, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Applies theme settings as CSS Custom Properties directly to document.documentElement (:root).
 * Updates public pages, dark surfaces, interactive buttons, highlights, and cards instantly.
 */
export function applyThemeToDocument(theme?: Partial<ThemeSettings> | null): void {
  if (typeof document === 'undefined') return;

  const effective: ThemeSettings = {
    ...defaultThemeSettings,
    ...(theme || {})
  };

  const primary = isValidHex(effective.primaryColor) ? effective.primaryColor : defaultThemeSettings.primaryColor;
  const secondary = isValidHex(effective.secondaryColor) ? effective.secondaryColor : defaultThemeSettings.secondaryColor;
  const accent = isValidHex(effective.accentColor) ? effective.accentColor : defaultThemeSettings.accentColor;
  const pageBg = isValidHex(effective.pageBgColor) ? effective.pageBgColor : defaultThemeSettings.pageBgColor;
  const cardBg = isValidHex(effective.cardBgColor) ? effective.cardBgColor : defaultThemeSettings.cardBgColor;
  const textPrimary = isValidHex(effective.textPrimaryColor) ? effective.textPrimaryColor : defaultThemeSettings.textPrimaryColor;
  const textSecondary = isValidHex(effective.textSecondaryColor) ? effective.textSecondaryColor : defaultThemeSettings.textSecondaryColor;
  const btnText = isValidHex(effective.btnTextColor) ? effective.btnTextColor : defaultThemeSettings.btnTextColor;

  const root = document.documentElement;

  // 1. Core Brand Colors
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-page-bg', pageBg);
  root.style.setProperty('--color-card-bg', cardBg);
  root.style.setProperty('--color-text-primary', textPrimary);
  root.style.setProperty('--color-text-secondary', textSecondary);
  root.style.setProperty('--color-btn-text', btnText);

  // 2. Computed Shades & Tints (Hover, Subtle, Highlights)
  root.style.setProperty('--color-primary-hover', adjustColorBrightness(primary, -12));
  root.style.setProperty('--color-primary-light', adjustColorBrightness(primary, 20));
  root.style.setProperty('--color-primary-subtle', `${primary}18`); // ~10% opacity

  root.style.setProperty('--color-secondary-dark', adjustColorBrightness(secondary, -20));
  root.style.setProperty('--color-secondary-surface', adjustColorBrightness(secondary, 15));

  root.style.setProperty('--color-accent-hover', adjustColorBrightness(accent, -12));
  root.style.setProperty('--color-accent-light', adjustColorBrightness(accent, 20));
  root.style.setProperty('--color-accent-subtle', `${accent}25`); // ~15% opacity

  // 3. Backward Compatibility Aliases for components using legacy variables
  root.style.setProperty('--color-background', pageBg);
  root.style.setProperty('--color-surface-muted', pageBg);
  root.style.setProperty('--color-text-muted', textSecondary);
  root.style.setProperty('--color-gold', accent);
  root.style.setProperty('--color-gold-light', adjustColorBrightness(accent, 15));
  root.style.setProperty('--color-gold-dark', adjustColorBrightness(accent, -15));
  root.style.setProperty('--color-bg-light', pageBg);
  root.style.setProperty('--color-bg-card', cardBg);
}
