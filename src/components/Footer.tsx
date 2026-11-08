import React from 'react';
import { Mail, Phone, MessageSquare, Shield, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../i18n';
import { LocalizedLink } from '../i18n/LocalizedLink';
import { SocialIcon } from './SocialIcon';

export const Footer: React.FC = () => {
  const { settings, footerConfig, socialLinks } = useSettings();
  const { t } = useLanguage();

  const footerSocials = (socialLinks || []).filter(
    (s) => s.isActive && s.showInFooter && Boolean(s.url?.trim())
  );

  const standardFooterTranslations: Record<string, string> = {
    'digital marketing & ads': 'footer.defaultServiceLinks.digitalMarketingAds',
    'social media management': 'footer.defaultServiceLinks.socialMediaManagement',
    'web & e-commerce development': 'footer.defaultServiceLinks.webEcommerceDev',
    'branding & visual design': 'footer.defaultServiceLinks.brandingVisualDesign',
    'consultation & strategy': 'footer.defaultServiceLinks.consultationStrategy',
    'digital products store': 'footer.defaultResourceLinks.digitalProductsStore',
    'client portfolio': 'footer.defaultResourceLinks.clientPortfolio',
    'case studies': 'footer.defaultResourceLinks.caseStudies',
    'agency faq': 'footer.defaultResourceLinks.agencyFaq',
    'client support desk': 'footer.defaultResourceLinks.clientSupportDesk',
  };

  const getFooterLabel = (label: string) => {
    const key = standardFooterTranslations[label.trim().toLowerCase()];
    return key ? t(key) : label;
  };

  return (
    <footer className="bg-[#08152F] border-t border-[#0D2044] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
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
              {footerConfig?.aboutText || t('footer.aboutDefault')}
            </p>
            <div className="text-xs text-[#FFC629] font-bold tracking-wide">
              {footerConfig?.tagline || settings.tagline || t('footer.mottoDefault')}
            </div>

            {/* Social Icons in Footer */}
            {footerSocials.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {t('footer.followSocials')}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {footerSocials.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[#0D2044] border border-[#112855] hover:border-[#2563EB] text-slate-300 hover:text-white hover:bg-[#2563EB] flex items-center justify-center transition-all shadow-sm"
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
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t('footer.agencyServices')}
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              {(footerConfig?.servicesLinks || [
                { label: t('footer.defaultServiceLinks.digitalMarketingAds'), path: '/services' },
                { label: t('footer.defaultServiceLinks.socialMediaManagement'), path: '/services' },
                { label: t('footer.defaultServiceLinks.webEcommerceDev'), path: '/services' },
                { label: t('footer.defaultServiceLinks.brandingVisualDesign'), path: '/services' },
                { label: t('footer.defaultServiceLinks.consultationStrategy'), path: '/services' },
              ]).map((link, idx) => (
                <li key={idx}>
                  <LocalizedLink to={link.path} className="text-slate-300 hover:text-[#FFC629] transition-colors">
                    {getFooterLabel(link.label)}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Products & Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t('footer.resourcesWork')}
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              {(footerConfig?.resourcesLinks || [
                { label: t('footer.defaultResourceLinks.digitalProductsStore'), path: '/products' },
                { label: t('footer.defaultResourceLinks.clientPortfolio'), path: '/portfolio' },
                { label: t('footer.defaultResourceLinks.caseStudies'), path: '/case-studies' },
                { label: t('footer.defaultResourceLinks.agencyFaq'), path: '/faq' },
                { label: t('footer.defaultResourceLinks.clientSupportDesk'), path: '/support' },
              ]).map((link, idx) => (
                <li key={idx}>
                  <LocalizedLink to={link.path} className="text-slate-300 hover:text-[#FFC629] transition-colors">
                    {getFooterLabel(link.label)}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t('footer.directConnect')}
            </h4>
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
              <p>{footerConfig?.timezoneText || t('footer.operatingTimezone')}</p>
              <p>{footerConfig?.currencyText || t('footer.primaryCurrency')}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal */}
        <div className="mt-12 pt-8 border-t border-[#0D2044] flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            © {new Date().getFullYear()} {footerConfig?.copyrightText || `${settings.brandName || 'Eagle Eye Digital'}. ${t('common.allRightsReserved')}`}
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 font-medium">
            <LocalizedLink to="/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</LocalizedLink>
            <LocalizedLink to="/terms" className="hover:text-white transition-colors">{t('footer.termsOfService')}</LocalizedLink>
            <LocalizedLink to="/refund-policy" className="hover:text-white transition-colors">{t('footer.refundPolicy')}</LocalizedLink>
            <LocalizedLink to="/license-policy" className="hover:text-white transition-colors">{t('footer.licensePolicy')}</LocalizedLink>
            <a href="/admin" className="hover:text-[#FFC629] flex items-center space-x-1 font-semibold text-slate-400 transition-colors">
              <Shield className="w-3.5 h-3.5 text-[#FFC629]" />
              <span>{t('footer.admin')}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
