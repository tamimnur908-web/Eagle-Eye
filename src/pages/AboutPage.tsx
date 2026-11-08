import React from 'react';
import { Target, Eye, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import { LocalizedLink } from '../i18n/LocalizedLink';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          {t('about.tag')}
        </span>
        <h1 className="text-4xl font-extrabold text-[#08152F]">{t('about.title')}</h1>
        <p className="text-base text-[#667085] leading-relaxed">
          {t('about.intro')}
        </p>
      </div>

      {/* Vision, Mission, Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm hover:border-[#2563EB]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#08152F]">{t('about.visionTitle')}</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            {t('about.visionDesc')}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm hover:border-[#2563EB]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#08152F]">{t('about.missionTitle')}</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            {t('about.missionDesc')}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm hover:border-[#2563EB]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#08152F]">{t('about.valuesTitle')}</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            {t('about.valuesDesc')}
          </p>
        </div>
      </div>

      {/* Brand Identity / Core Tenets */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 space-y-8 shadow-sm">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            {t('about.motto')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#08152F] mt-2">
            {t('about.philosophyTitle')}
          </h2>
          <p className="text-sm text-[#667085] mt-2">
            {t('about.philosophyDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#08152F]">{t('about.cohesionTitle')}</h4>
              <p className="text-xs text-[#667085] mt-1">
                {t('about.cohesionDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#08152F]">{t('about.rigorTitle')}</h4>
              <p className="text-xs text-[#667085] mt-1">
                {t('about.rigorDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="text-center py-8">
        <h3 className="text-xl font-bold text-[#08152F] mb-4">{t('about.ctaTitle')}</h3>
        <LocalizedLink
          to="/contact"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all"
        >
          <span>{t('about.ctaButton')}</span>
          <ArrowRight className="w-4 h-4" />
        </LocalizedLink>
      </div>

    </div>
  );
};
