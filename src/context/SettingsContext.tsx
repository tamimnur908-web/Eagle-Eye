import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, SocialLink, HeaderConfig, FooterConfig } from '../types';
import {
  defaultSiteSettings,
  defaultHeaderConfig,
  defaultFooterConfig,
  defaultSocialLinks,
  getSiteSettings,
  saveSiteSettings
} from '../services/firestoreService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsContextType {
  settings: SiteSettings;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  socialLinks: SocialLink[];
  loading: boolean;
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  // Load initial settings and attach realtime listener if available
  const loadSettingsData = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
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
          setSettings({
            brandName: data.brandName || defaultSiteSettings.brandName,
            tagline: data.tagline || defaultSiteSettings.tagline,
            logoUrl: data.logoUrl || defaultSiteSettings.logoUrl,
            businessEmail: data.businessEmail || defaultSiteSettings.businessEmail,
            whatsappNumber: data.whatsappNumber || defaultSiteSettings.whatsappNumber,
            currency: data.currency || defaultSiteSettings.currency,
            headerConfig: {
              ...defaultHeaderConfig,
              ...(data.headerConfig || {}),
              navLinks: data.headerConfig?.navLinks && data.headerConfig.navLinks.length > 0
                ? data.headerConfig.navLinks
                : defaultHeaderConfig.navLinks
            },
            footerConfig: {
              ...defaultFooterConfig,
              ...(data.footerConfig || {}),
              servicesLinks: data.footerConfig?.servicesLinks && data.footerConfig.servicesLinks.length > 0
                ? data.footerConfig.servicesLinks
                : defaultFooterConfig.servicesLinks,
              resourcesLinks: data.footerConfig?.resourcesLinks && data.footerConfig.resourcesLinks.length > 0
                ? data.footerConfig.resourcesLinks
                : defaultFooterConfig.resourcesLinks
            },
            socialLinks: data.socialLinks && data.socialLinks.length > 0
              ? data.socialLinks
              : defaultSocialLinks,
          });
        }
      }, (error) => {
        console.warn('Realtime settings listener error:', error);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Error establishing Firestore onSnapshot for settings:', e);
    }
  }, []);

  const saveSettings = async (newSettings: Partial<SiteSettings>) => {
    const merged: SiteSettings = {
      ...settings,
      ...newSettings,
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

  const headerConfig = settings.headerConfig || defaultHeaderConfig;
  const footerConfig = settings.footerConfig || defaultFooterConfig;
  const socialLinks = settings.socialLinks || defaultSocialLinks;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        headerConfig,
        footerConfig,
        socialLinks,
        loading,
        saveSettings,
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
