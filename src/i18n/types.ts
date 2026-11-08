// ============================================================================
// Eagle Eye Digital — Internationalization (i18n) Type Definitions
// ============================================================================

export type Language = 'en' | 'bn';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'bn'];

export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  bn: 'বাংলা',
};

export const LANGUAGE_NATIVE_LABELS: Record<Language, string> = {
  en: 'EN',
  bn: 'বাং',
};

// Translation dictionary can be nested objects or flat string values
export type TranslationValue = string | Record<string, any>;
export type TranslationDictionary = Record<string, TranslationValue>;
