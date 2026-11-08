// ============================================================================
// Eagle Eye Digital — Language Switcher Component
// Professional, clean bilingual switcher for header and settings.
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { LANGUAGE_LABELS, type Language } from './types';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  /** Render style variant */
  variant?: 'header' | 'dropdown' | 'settings' | 'mobile';
  /** Additional CSS classes */
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const otherLang: Language = language === 'en' ? 'bn' : 'en';

  const handleSwitch = (targetLang: Language) => {
    setLanguage(targetLang);
    setOpen(false);
  };

  // ── Settings Variant (for Account/Admin Settings pages) ──────────────
  if (variant === 'settings') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <label className="text-xs font-bold text-[#08152F]">
          {t('language.interfaceLanguage')}
        </label>
        <div className="flex items-center gap-1 bg-[#F3F5F9] rounded-lg p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => handleSwitch('en')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-white text-[#2563EB] shadow-sm border border-blue-100'
                : 'text-[#667085] hover:text-[#08152F]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleSwitch('bn')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              language === 'bn'
                ? 'bg-white text-[#2563EB] shadow-sm border border-blue-100'
                : 'text-[#667085] hover:text-[#08152F]'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>
    );
  }

  // ── Mobile Variant (simplified toggle for mobile menu) ───────────────
  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={() => handleSwitch(otherLang)}
        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 text-sm font-bold text-[#08152F] hover:text-[#2563EB] transition-all ${className}`}
      >
        <Globe className="w-4 h-4" />
        <span>{LANGUAGE_LABELS[otherLang]}</span>
      </button>
    );
  }

  // ── Header Variant (default — compact dropdown in navbar) ────────────
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#2563EB] bg-white hover:bg-blue-50/50 text-xs font-bold text-[#08152F] transition-all shadow-2xs cursor-pointer"
        title={t('language.selectLanguage')}
        aria-label={t('language.selectLanguage')}
      >
        <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
        <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'বাং'}</span>
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => handleSwitch('en')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold transition-colors ${
              language === 'en'
                ? 'bg-blue-50 text-[#2563EB]'
                : 'text-[#172033] hover:bg-slate-50 hover:text-[#2563EB]'
            }`}
          >
            <span className="w-5 text-center text-[13px]">🇺🇸</span>
            <span>English</span>
            {language === 'en' && (
              <svg className="w-3.5 h-3.5 ml-auto text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSwitch('bn')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold transition-colors ${
              language === 'bn'
                ? 'bg-blue-50 text-[#2563EB]'
                : 'text-[#172033] hover:bg-slate-50 hover:text-[#2563EB]'
            }`}
          >
            <span className="w-5 text-center text-[13px]">🇧🇩</span>
            <span>বাংলা</span>
            {language === 'bn' && (
              <svg className="w-3.5 h-3.5 ml-auto text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
