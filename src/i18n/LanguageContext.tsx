// ============================================================================
// Eagle Eye Digital — Language Context Provider
// Centralized i18n system: manages language state, persistence, and translation.
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { Language } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './types';
import en from './en';
import bn from './bn';

// ── Translation Dictionaries ───────────────────────────────────────────────
const translations: Record<Language, any> = { en, bn };

// ── Utility: deep-get a nested key like "nav.home" from an object ──────────
function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

// ── Local Storage Key ──────────────────────────────────────────────────────
const LS_LANG_KEY = 'eed_language';

// ── Extract language from URL path ─────────────────────────────────────────
export function getLanguageFromPath(pathname: string): Language | null {
  const match = pathname.match(/^\/(en|bn)(\/|$)/);
  if (match && SUPPORTED_LANGUAGES.includes(match[1] as Language)) {
    return match[1] as Language;
  }
  return null;
}

// ── Strip language prefix from path ────────────────────────────────────────
export function stripLanguagePrefix(pathname: string): string {
  const cleaned = pathname.replace(/^\/(en|bn)(\/|$)/, '/').replace(/\/+$/, '');
  return cleaned === '' ? '/' : (cleaned.startsWith('/') ? cleaned : '/' + cleaned);
}

// ── Build localized path ───────────────────────────────────────────────────
export function buildLocalizedPath(pathname: string, lang: Language): string {
  const stripped = stripLanguagePrefix(pathname);
  // Don't add prefix to admin routes
  if (stripped.startsWith('/admin')) return stripped;
  return stripped === '/' ? `/${lang}/` : `/${lang}${stripped}`;
}

// ── Context Type ───────────────────────────────────────────────────────────
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  switchLanguageUrl: (targetLang: Language) => string;
  localizedPath: (path: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string) => key,
  switchLanguageUrl: () => '',
  localizedPath: (path: string) => path,
  isRTL: false,
});

// ── Provider Component ─────────────────────────────────────────────────────
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  // Resolve initial language: URL > localStorage > default
  const resolveInitialLanguage = (): Language => {
    const urlLang = getLanguageFromPath(location.pathname);
    if (urlLang) return urlLang;

    try {
      const stored = localStorage.getItem(LS_LANG_KEY) as Language | null;
      if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
    } catch {}

    return DEFAULT_LANGUAGE;
  };

  const [language, setLanguageState] = useState<Language>(resolveInitialLanguage);

  // Load user language preference from Firestore on auth
  useEffect(() => {
    if (!currentUser) return;

    const loadUserLanguage = async () => {
      try {
        const collection = isAdmin ? 'admins' : 'users';
        const userDoc = await getDoc(doc(db, collection, currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const storedLang = data.languagePreference as Language | undefined;
          if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
            setLanguageState(storedLang);
            localStorage.setItem(LS_LANG_KEY, storedLang);
          }
        }
      } catch (err) {
        console.warn('Could not load language preference:', err);
      }
    };

    loadUserLanguage();
  }, [currentUser, isAdmin]);

  // Sync URL with language state (only for non-admin routes)
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    if (isAdminRoute) return;

    const urlLang = getLanguageFromPath(location.pathname);
    if (urlLang && urlLang !== language) {
      setLanguageState(urlLang);
      localStorage.setItem(LS_LANG_KEY, urlLang);
    }
  }, [location.pathname]);

  // Update HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr'; // Both EN and BN are LTR
    // Apply Bangla font class
    if (language === 'bn') {
      document.documentElement.classList.add('lang-bn');
    } else {
      document.documentElement.classList.remove('lang-bn');
    }
  }, [language]);

  // Set language with persistence and navigation
  const setLanguage = useCallback(async (newLang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return;
    setLanguageState(newLang);
    localStorage.setItem(LS_LANG_KEY, newLang);

    // Save to Firestore for authenticated users
    if (currentUser) {
      try {
        const collection = isAdmin ? 'admins' : 'users';
        await setDoc(
          doc(db, collection, currentUser.uid),
          { languagePreference: newLang, updatedAt: Date.now() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not save language preference:', err);
      }
    }

    // Navigate to new language URL (non-admin routes only)
    const isAdminRoute = location.pathname.startsWith('/admin');
    if (!isAdminRoute) {
      const newPath = buildLocalizedPath(location.pathname, newLang);
      const currentFullPath = location.pathname + location.search + location.hash;
      const newFullPath = newPath + location.search + location.hash;
      if (currentFullPath !== newFullPath) {
        navigate(newFullPath, { replace: true });
      }
    }
  }, [currentUser, isAdmin, location, navigate]);

  // Translation function with fallback
  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let value = getNestedValue(translations[language], key);
    // Fallback to English
    if (value === undefined && language !== DEFAULT_LANGUAGE) {
      value = getNestedValue(translations[DEFAULT_LANGUAGE], key);
    }
    // Final fallback: return the key itself
    if (value === undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation key: "${key}" for language "${language}"`);
      }
      return key;
    }
    // Apply replacements like {{name}}
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      }
    }
    return value;
  }, [language]);

  // Generate URL for the other language version of current page
  const switchLanguageUrl = useCallback((targetLang: Language): string => {
    return buildLocalizedPath(location.pathname, targetLang) + location.search + location.hash;
  }, [location]);

  // Build a localized path from a bare path
  const localizedPath = useCallback((path: string): string => {
    // Don't localize admin paths
    if (path.startsWith('/admin')) return path;
    return buildLocalizedPath(path, language);
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    switchLanguageUrl,
    localizedPath,
    isRTL: false,
  }), [language, setLanguage, t, switchLanguageUrl, localizedPath]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
