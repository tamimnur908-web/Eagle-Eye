import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Shield, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { SocialIcon } from './SocialIcon';

export const Footer: React.FC = () => {
  const { settings, footerConfig, socialLinks } = useSettings();

  const footerSocials = (socialLinks || []).filter(
    (s) => s.isActive && s.showInFooter && Boolean(s.url?.trim())
  );

  return (
    <footer className="bg-[#08152F] border-t border-[#112855] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={settings.logoUrl || '/logo.jpg'}
                alt={settings.brandName || 'Eagle Eye Digital'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
                className="h-10 w-auto max-w-[120px] rounded border border-white/20 bg-white p-0.5 shadow-sm object-contain"
              />
              <span className="text-lg font-bold tracking-wider text-white">
                {settings.brandName || 'Eagle Eye Digital'}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {footerConfig?.aboutText ||
                'Your dedicated commercial partner. Specialized in digital marketing, full-funnel agency execution, performance ads, web development, and high-converting digital assets.'}
            </p>
            <div className="text-xs text-[#FFC629] font-bold tracking-wide">
              {footerConfig?.tagline || settings.tagline || 'Focus • Strategy • Growth'}
            </div>

            {/* Social Icons in Footer */}
            {footerSocials.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Follow Our Socials
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {footerSocials.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#0D2044] border border-[#112855] hover:border-[#2563EB] text-slate-300 hover:text-white hover:bg-[#2563EB] flex items-center justify-center transition-all shadow-sm hover:scale-105"
                      title={item.platform}
                    >
                      <SocialIcon link={item} size={16} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links: Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Agency Services</h4>
            <ul className="space-y-2 text-sm font-medium">
              {(footerConfig?.servicesLinks || [
                { label: 'Digital Marketing & Ads', path: '/services' },
                { label: 'Social Media Management', path: '/services' },
                { label: 'Web & E-Commerce Development', path: '/services' },
                { label: 'Branding & Visual Design', path: '/services' },
                { label: 'Consultation & Strategy', path: '/services' },
              ]).map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-slate-300 hover:text-[#FFC629] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Products & Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Resources & Work</h4>
            <ul className="space-y-2 text-sm font-medium">
              {(footerConfig?.resourcesLinks || [
                { label: 'Digital Products Store', path: '/products' },
                { label: 'Client Portfolio', path: '/portfolio' },
                { label: 'Case Studies', path: '/case-studies' },
                { label: 'Agency FAQ', path: '/faq' },
                { label: 'Client Support Desk', path: '/support' },
              ]).map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-slate-300 hover:text-[#FFC629] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Direct Connect</h4>
            <div className="space-y-2 text-sm font-medium">
              <a
                href={`mailto:${footerConfig?.contactEmail || settings.businessEmail || 'Tamimnur908@gmail.com'}`}
                className="flex items-center space-x-2 text-slate-200 hover:text-[#FFC629] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#FFC629]" />
                <span className="truncate">{footerConfig?.contactEmail || settings.businessEmail || 'Tamimnur908@gmail.com'}</span>
              </a>
              <a
                href={`https://wa.me/88${(footerConfig?.contactWhatsapp || settings.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {footerConfig?.contactWhatsapp || settings.whatsappNumber || '01836126791'}</span>
              </a>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+880 {footerConfig?.contactPhone || settings.whatsappNumber || '01836126791'}</span>
              </div>
            </div>

            {/* Operating Hours & Timezone */}
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              {footerConfig?.operatingHours && (
                <p className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{footerConfig.operatingHours}</span>
                </p>
              )}
              <p>{footerConfig?.timezoneText || 'Operating Timezone: Asia/Dhaka (GMT+6)'}</p>
              <p>{footerConfig?.currencyText || `Primary Currency: ${settings.currency || 'BDT'} (৳)`}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal */}
        <div className="mt-12 pt-8 border-t border-[#112855] flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            © {new Date().getFullYear()} {footerConfig?.copyrightText || `${settings.brandName || 'Eagle Eye Digital'}. All rights reserved.`}
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 font-medium">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link to="/license-policy" className="hover:text-white transition-colors">License Policy</Link>
            <Link to="/admin" className="hover:text-[#FFD359] flex items-center space-x-1 font-semibold text-[#FFC629] transition-colors">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
