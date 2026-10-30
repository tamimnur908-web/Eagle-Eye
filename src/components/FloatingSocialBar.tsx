import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { SocialIcon, SOCIAL_ICON_OPTIONS } from './SocialIcon';
import { ChevronRight, ChevronLeft, Share2 } from 'lucide-react';

export const FloatingSocialBar: React.FC = () => {
  const { socialLinks } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  // Filter only active social links selected for Floating Sidebar with valid URLs
  const activeFloatingLinks = socialLinks.filter(
    (item) => item.isActive && item.showInFloatingSidebar && Boolean(item.url?.trim())
  );

  if (activeFloatingLinks.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Social media quick connect"
      className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 transition-transform duration-300"
      style={{ transform: isCollapsed ? 'translate(calc(100% - 14px), -50%)' : 'translate(0, -50%)' }}
    >
      <div className="relative flex items-center">
        {/* Toggle Collapse Pill */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-10 rounded-l-xl bg-white border-l border-y border-slate-200 shadow-md text-[#667085] hover:text-[#2563EB] flex items-center justify-center transition-colors"
          title={isCollapsed ? 'Expand social links' : 'Collapse social links'}
        >
          {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Floating Icons Container */}
        <div className="flex flex-col gap-2.5 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-200/90 ring-1 ring-black/5">
          {activeFloatingLinks.map((item) => {
            const option = SOCIAL_ICON_OPTIONS.find(
              (o) => o.key.toLowerCase() === (item.iconKey || '').toLowerCase()
            );
            const brandColor = option?.color || '#2563EB';

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                title={item.platform}
              >
                <SocialIcon link={item} size={18} className="transition-transform group-hover:scale-110" />

                {/* Floating Tooltip Bubble */}
                <span className="pointer-events-none absolute right-full mr-3.5 px-2.5 py-1 rounded-lg bg-[#08152F] text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-95 group-hover:scale-100">
                  {item.platform}
                  <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#08152F]" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
