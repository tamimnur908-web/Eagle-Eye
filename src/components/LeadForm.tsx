import React, { useState, useEffect } from 'react';
import { createLead, getPublishedServices } from '../services/firestoreService';
import { Service } from '../types';
import { Send, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useAuthModal, clearPendingAction } from '../context/AuthModalContext';
import { useLanguage } from '../i18n';
import { LocalizedLink } from '../i18n/LocalizedLink';

interface LeadFormProps {
  initialService?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ initialService = '' }) => {
  const { currentUser } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { t, localizedPath } = useLanguage();
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phoneOrWhatsApp: '',
    serviceInterest: initialService || 'Social Media Management',
    websiteOrSocial: '',
    budgetRange: '৳20,000 - ৳50,000 / month',
    deadline: '',
    projectDescription: '',
    preferredContactMethod: 'WhatsApp' as 'WhatsApp' | 'Email' | 'Phone',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore draft if saved previously
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem('eed_pending_inquiry');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const srvs = await getPublishedServices();
        setAvailableServices(srvs);
        if (initialService) {
          setFormData((prev) => ({ ...prev, serviceInterest: initialService }));
        } else if (srvs.length > 0 && !formData.serviceInterest) {
          setFormData((prev) => ({ ...prev, serviceInterest: srvs[0].name }));
        }
      } catch (e) {
        console.warn('Could not load service options in LeadForm:', e);
      }
    };
    loadServices();
  }, [initialService]);

  // Sync logged-in user profile
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUser.displayName || '',
        email: prev.email || currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Save draft in case login is required
    sessionStorage.setItem('eed_pending_inquiry', JSON.stringify(formData));

    if (!currentUser) {
      openLoginModal({
        actionType: 'inquiry',
        redirectPath: window.location.pathname,
      });
      return;
    }

    setLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.phoneOrWhatsApp || !formData.projectDescription) {
        throw new Error(t('leadForm.validationError'));
      }

      await createLead({
        name: formData.name.trim(),
        businessName: formData.businessName.trim(),
        email: formData.email.trim(),
        phoneOrWhatsApp: formData.phoneOrWhatsApp.trim(),
        serviceInterest: formData.serviceInterest,
        websiteOrSocial: formData.websiteOrSocial.trim(),
        budgetRange: formData.budgetRange,
        deadline: formData.deadline.trim(),
        projectDescription: formData.projectDescription.trim(),
        preferredContactMethod: formData.preferredContactMethod,
        userId: currentUser.uid,
      });

      // Clear draft and pending action
      sessionStorage.removeItem('eed_pending_inquiry');
      clearPendingAction();

      setSuccess(true);
      setFormData({
        name: currentUser.displayName || '',
        businessName: '',
        email: currentUser.email || '',
        phoneOrWhatsApp: '',
        serviceInterest: availableServices[0]?.name || 'Digital Marketing',
        websiteOrSocial: '',
        budgetRange: '৳20,000 - ৳50,000 / month',
        deadline: '',
        projectDescription: '',
        preferredContactMethod: 'WhatsApp',
      });
    } catch (err: any) {
      setError(err.message || t('leadForm.submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8">
      {success ? (
        <div className="text-center py-10 space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-2xl font-bold text-[#08152F]">{t('leadForm.successTitle')}</h3>
          <p className="text-[#667085] max-w-md mx-auto text-sm">
            {t('leadForm.successMessage')}
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="text-xs text-[#2563EB] font-semibold underline hover:text-[#1D4ED8] cursor-pointer"
            >
              {t('leadForm.sendAnother')}
            </button>
            <LocalizedLink
              to="/account?tab=inquiries"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('leadForm.viewInAccount')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </LocalizedLink>
            <a
              href={`https://wa.me/88${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              {t('leadForm.messageOnWhatsApp')}
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-b border-slate-200 pb-4 mb-4">
            <h3 className="text-xl font-bold text-[#08152F]">{t('leadForm.heading')}</h3>
            <p className="text-xs text-[#667085] mt-1">
              {t('leadForm.description')}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.nameLabel')} <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('leadForm.namePlaceholder')}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.businessLabel')}
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder={t('leadForm.businessPlaceholder')}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.emailLabel')} <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('leadForm.emailPlaceholder')}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.phoneLabel')} <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneOrWhatsApp}
                onChange={(e) => setFormData({ ...formData, phoneOrWhatsApp: e.target.value })}
                placeholder={t('leadForm.phonePlaceholder')}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.serviceLabel')}
              </label>
              <select
                value={formData.serviceInterest}
                onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              >
                {availableServices.length > 0 ? (
                  availableServices.map((srv) => (
                    <option key={srv.id} value={srv.name}>
                      {srv.name} ({srv.category})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Social Media Management">{t('leadForm.serviceOptions.socialMedia')}</option>
                    <option value="Meta Ads Management">{t('leadForm.serviceOptions.metaAds')}</option>
                    <option value="Google Ads Management">{t('leadForm.serviceOptions.googleAds')}</option>
                    <option value="Search Engine Optimization (SEO)">{t('leadForm.serviceOptions.seo')}</option>
                    <option value="Website Design and Development">{t('leadForm.serviceOptions.website')}</option>
                    <option value="E-commerce Website Development">{t('leadForm.serviceOptions.ecommerce')}</option>
                    <option value="AI Workflow Automation">{t('leadForm.serviceOptions.aiAutomation')}</option>
                  </>
                )}
                <option value="Comprehensive Growth Retainer">{t('leadForm.serviceOptions.growthPackage')}</option>
                <option value="Custom Consultation">{t('leadForm.serviceOptions.custom')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.budgetLabel')}
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              >
                <option value="৳20,000 - ৳50,000 / month">{t('leadForm.budgetOptions.range1')}</option>
                <option value="৳50,000 - ৳1,00,000 / month">{t('leadForm.budgetOptions.range2')}</option>
                <option value="৳1,00,000 - ৳3,00,000 / month">{t('leadForm.budgetOptions.range3')}</option>
                <option value="৳3,00,000+ / month">{t('leadForm.budgetOptions.range4')}</option>
                <option value="Custom / Project-based">{t('leadForm.budgetOptions.custom')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.websiteLabel')}
              </label>
              <input
                type="text"
                value={formData.websiteOrSocial}
                onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                placeholder={t('leadForm.websitePlaceholder')}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                {t('leadForm.contactMethodLabel')}
              </label>
              <div className="flex space-x-4 pt-2">
                {[
                  { id: 'WhatsApp', label: t('common.whatsapp') },
                  { id: 'Email', label: t('common.email') },
                  { id: 'Phone', label: t('common.phone') }
                ].map((item) => (
                  <label key={item.id} className="flex items-center space-x-1.5 text-xs text-[#172033] font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value={item.id}
                      checked={formData.preferredContactMethod === item.id}
                      onChange={() => setFormData({ ...formData, preferredContactMethod: item.id as any })}
                      className="accent-[#2563EB]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              {t('leadForm.projectLabel')} <span className="text-[#2563EB]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              placeholder={t('leadForm.projectPlaceholder')}
              className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#FFC629] hover:bg-[#e6b122] text-[#08152F] font-black text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-[#FFC629]/25 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <span>{t('leadForm.sendingBtn')}</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#08152F]" />
                <span>{t('leadForm.submitBtn')}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
