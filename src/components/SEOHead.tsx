// ============================================================================
// Eagle Eye Digital — SEO Head Component
// Manages lang, hreflang, and canonical meta tags for bilingual support.
// ============================================================================

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage, buildLocalizedPath, stripLanguagePrefix } from '../i18n';

export const SEOHead: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const barePath = stripLanguagePrefix(location.pathname);
    const baseUrl = window.location.origin;

    // Build canonical and hreflang URLs
    const enUrl = `${baseUrl}/en${barePath === '/' ? '/' : barePath}`;
    const bnUrl = `${baseUrl}/bn${barePath === '/' ? '/' : barePath}`;
    const canonicalUrl = language === 'en' ? enUrl : bnUrl;

    // ── Update or create canonical link ──
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // ── Update or create hreflang links ──
    const hreflangConfigs = [
      { lang: 'en', url: enUrl },
      { lang: 'bn', url: bnUrl },
      { lang: 'x-default', url: enUrl },
    ];

    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // Add new hreflang tags
    hreflangConfigs.forEach(({ lang, url }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url);
      document.head.appendChild(link);
    });

    // ── Update HTML lang attribute ──
    document.documentElement.lang = language;

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    };
  }, [language, location.pathname]);

  return null; // This component only manages document.head side-effects
};

export default SEOHead;
