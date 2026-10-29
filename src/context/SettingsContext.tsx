import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, SocialLink, HeaderConfig, FooterConfig, ThemeSettings } from '../types';
import {
  defaultSiteSettings,
  defaultHeaderConfig,
  defaultFooterConfig,
  defaultSocialLinks,
  getSiteSettings,
  saveSiteSettings
} from '../services/firestoreService';
import { defaultThemeSettings, applyThemeToDocument } from '../utils/theme';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsContextType {
  settings: SiteSettings;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  socialLinks: SocialLink[];
  theme: ThemeSettings;
  loading: boolean;
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  saveThemeSettings: (newTheme: Partial<ThemeSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('eed_site_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) return parsed;
      }
    } catch {}
    return defaultSiteSettings;
  });
  const [loading, setLoading] = useState(true);

  // Load initial settings and attach realtime listener if available
  const loadSettingsData = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
      try {
        localStorage.setItem('eed_site_settings', JSON.stringify(data));
      } catch {}
    } catch (err) {
      console.warn('Could not load site settings, falling back to defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();

    // Attach real-time snapshot listener so multiple tabs/devices update instantly
    try {
      const docRef = doc(db, 'settings', 'site_settings');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updated: SiteSettings = {
            brandName: data.brandName ?? defaultSiteSettings.brandName,
            tagline: data.tagline ?? defaultSiteSettings.tagline,
            logoUrl: data.logoUrl ?? defaultSiteSettings.logoUrl,
            businessEmail: data.businessEmail ?? defaultSiteSettings.businessEmail,
            whatsappNumber: data.whatsappNumber ?? defaultSiteSettings.whatsappNumber,
            currency: data.currency ?? defaultSiteSettings.currency,
            theme: data.theme ? { ...defaultThemeSettings, ...data.theme } : defaultThemeSettings,
            headerConfig: {
              ...defaultHeaderConfig,
              ...(data.headerConfig || {}),
              navLinks: Array.isArray(data.headerConfig?.navLinks)
                ? data.headerConfig.navLinks
                : defaultHeaderConfig.navLinks
            },
            footerConfig: {
              ...defaultFooterConfig,
              ...(data.footerConfig || {}),
              servicesLinks: Array.isArray(data.footerConfig?.servicesLinks)
                ? data.footerConfig.servicesLinks
                : defaultFooterConfig.servicesLinks,
              resourcesLinks: Array.isArray(data.footerConfig?.resourcesLinks)
                ? data.footerConfig.resourcesLinks
                : defaultFooterConfig.resourcesLinks
            },
            socialLinks: Array.isArray(data.socialLinks)
              ? data.socialLinks
              : defaultSocialLinks,
          };
          setSettings(updated);
          try {
            localStorage.setItem('eed_site_settings', JSON.stringify(updated));
          } catch {}
        }
      }, (error) => {
        console.warn('Realtime settings listener error:', error);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Error establishing Firestore onSnapshot for settings:', e);
    }
  }, []);

  // Real-time CSS Custom Properties injection
  useEffect(() => {
    applyThemeToDocument(settings.theme || defaultThemeSettings);
  }, [settings.theme]);

  const saveSettings = async (newSettings: Partial<SiteSettings>) => {
    const merged: SiteSettings = {
      ...settings,
      ...newSettings,
      theme: newSettings.theme !== undefined ? newSettings.theme : (settings.theme || defaultThemeSettings),
      headerConfig: {
        ...(settings.headerConfig || defaultHeaderConfig),
        ...(newSettings.headerConfig || {})
      },
      footerConfig: {
        ...(settings.footerConfig || defaultFooterConfig),
        ...(newSettings.footerConfig || {})
      },
      socialLinks: newSettings.socialLinks !== undefined ? newSettings.socialLinks : settings.socialLinks
    };

    setSettings(merged);
    await saveSiteSettings(merged);
  };

  const saveThemeSettings = async (newTheme: Partial<ThemeSettings>) => {
    const mergedTheme: ThemeSettings = {
      ...(settings.theme || defaultThemeSettings),
      ...newTheme,
      updatedAt: Date.now()
    };
    applyThemeToDocument(mergedTheme);
    await saveSettings({ theme: mergedTheme });
  };

  const headerConfig = settings.headerConfig || defaultHeaderConfig;
  const footerConfig = settings.footerConfig || defaultFooterConfig;
  const socialLinks = settings.socialLinks || defaultSocialLinks;
  const theme = settings.theme || defaultThemeSettings;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        headerConfig,
        footerConfig,
        socialLinks,
        theme,
        loading,
        saveSettings,
        saveThemeSettings,
        refreshSettings: loadSettingsData
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
