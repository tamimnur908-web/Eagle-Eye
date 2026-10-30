import React, { useState, useEffect } from 'react';
import { createLead, getPublishedServices } from '../services/firestoreService';
import { Service } from '../types';
import { Send, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useAuthModal, savePendingAction, getPendingAction, clearPendingAction } from '../context/AuthModalContext';
import { Link } from 'react-router-dom';

interface LeadFormProps {
  initialService?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ initialService = '' }) => {
  const { currentUser } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phoneOrWhatsApp: '',
    serviceInterest: initialService || 'Social Media Management',
    websiteOrSocial: '',
    budgetRange: '২০,০০০ - ৫০,০০০ টাকা / মাস',
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

  // Sync user details and pending inquiry on login
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || currentUser.email || '',
        name: prev.name || currentUser.displayName || ''
      }));

      // Check if user was redirected back after login with pending inquiry
      const pending = getPendingAction();
      if (pending && pending.type === 'inquiry' && pending.data) {
        setFormData((prev) => ({
          ...prev,
          ...(pending.data as any),
          email: currentUser.email || prev.email,
          name: currentUser.displayName || prev.name,
        }));
      }
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Guest protection: Require login to submit inquiry
    if (!currentUser) {
      sessionStorage.setItem('eed_pending_inquiry', JSON.stringify(formData));
      savePendingAction({
        type: 'inquiry',
        data: formData,
        redirectPath: window.location.pathname,
      });
      openLoginModal({
        actionType: 'inquiry',
        redirectPath: window.location.pathname,
      });
      return;
    }

    setLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.phoneOrWhatsApp || !formData.projectDescription) {
        throw new Error('অনুগ্রহ করে প্রয়োজনীয় সকল তথ্য পূরণ করুন।');
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
        budgetRange: '২০,০০০ - ৫০,০০০ টাকা / মাস',
        deadline: '',
        projectDescription: '',
        preferredContactMethod: 'WhatsApp',
      });
    } catch (err: any) {
      setError(err.message || 'অনুসন্ধান পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8">
      {success ? (
        <div className="text-center py-10 space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-2xl font-bold text-[#08152F]">আপনার অনুসন্ধান সফলভাবে জমা হয়েছে!</h3>
          <p className="text-[#667085] max-w-md mx-auto text-sm">
            Eagle Eye Digital-এ যোগাযোগ করার জন্য ধন্যবাদ। আমাদের টিম শীঘ্রই আপনার প্রজেক্টের বিস্তারিত পর্যালোচনা করে আপনার পছন্দের মাধ্যমে যোগাযোগ করবে।
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="text-xs text-[#2563EB] font-semibold underline hover:text-[#1D4ED8] cursor-pointer"
            >
              আরেকটি অনুসন্ধান পাঠান
            </button>
            <Link
              to="/account?tab=inquiries"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>আমার অ্যাকাউন্টে দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={`https://wa.me/88${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              হোয়াটসঅ্যাপে মেসেজ দিন
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-b border-slate-200 pb-4 mb-4">
            <h3 className="text-xl font-bold text-[#08152F]">পরামর্শ ও কোটেশন অনুরোধ করুন</h3>
            <p className="text-xs text-[#667085] mt-1">
              আপনার ব্যবসায়িক লক্ষ্য ও চ্যালেঞ্জ আমাদের জানান। আমরা আপনার ব্যবসার বৃদ্ধির জন্য উপযুক্ত স্ট্র্যাটেজি তৈরি করব।
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
                আপনার নাম <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="যেমন: তামিম নূর"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                ব্যবসা বা ব্র্যান্ডের নাম
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="যেমন: অ্যাপেক্স রিটেইল"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                ইমেইল ঠিকানা <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                মোবাইল বা হোয়াটসঅ্যাপ নম্বর <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneOrWhatsApp}
                onChange={(e) => setFormData({ ...formData, phoneOrWhatsApp: e.target.value })}
                placeholder="০১XXXXXXXXX"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                প্রয়োজনীয় সার্ভিস
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
                    <option value="Social Media Management">সোশ্যাল মিডিয়া ম্যানেজমেন্ট</option>
                    <option value="Meta Ads Management">মেটা বিজ্ঞাপন ম্যানেজমেন্ট</option>
                    <option value="Google Ads Management">গুগল বিজ্ঞাপন ম্যানেজমেন্ট</option>
                    <option value="Search Engine Optimization (SEO)">সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO)</option>
                    <option value="Website Design and Development">ওয়েবসাইট ডিজাইন ও ডেভেলপমেন্ট</option>
                    <option value="E-commerce Website Development">ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট</option>
                    <option value="AI Workflow Automation">এআই অটোমেশন</option>
                  </>
                )}
                <option value="Comprehensive Growth Retainer">সম্পূর্ণ গ্রোথ প্যাকেজ (মাল্টি-সার্ভিস)</option>
                <option value="Custom Consultation">অন্যান্য / কাস্টম পরামর্শ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                আনুমানিক বাজেট সীমা
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              >
                <option value="২০,০০০ টাকার নিচে">২০,০০০ টাকার নিচে</option>
                <option value="২০,০০০ - ৫০,০০০ টাকা / মাস">২০,০০০ - ৫০,০০০ টাকা / মাস</option>
                <option value="৫০,০০০ - ১৫০,০০০ টাকা / মাস">৫০,০০০ - ১৫০,০০০ টাকা / মাস</option>
                <option value="১,৫০,০০০+ টাকা (এন্টারপ্রাইজ)">১,৫০,০০০+ টাকা (এন্টারপ্রাইজ)</option>
                <option value="কাস্টম / নির্ধারিত নয়">কাস্টম / নির্ধারিত নয়</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                বর্তমান ওয়েবসাইট বা সোশ্যাল পেজের লিংক
              </label>
              <input
                type="text"
                value={formData.websiteOrSocial}
                onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                যোগাযোগের মাধ্যম
              </label>
              <div className="flex space-x-4 pt-2">
                {[
                  { id: 'WhatsApp', label: 'হোয়াটসঅ্যাপ' },
                  { id: 'Email', label: 'ইমেইল' },
                  { id: 'Phone', label: 'ফোন' }
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
              প্রজেক্টের বিবরণ ও লক্ষ্য <span className="text-[#2563EB]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              placeholder="আপনার ব্র্যান্ড, কী লক্ষ্য অর্জন করতে চান, সময়সীমা বা বিদ্যমান চ্যালেঞ্জ সম্পর্কে বিস্তারিত লিখুন..."
              className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#FFC629] hover:bg-[#e6b122] text-[#08152F] font-black text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-[#FFC629]/25 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <span>পাঠানো হচ্ছে...</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#08152F]" />
                <span>অনুসন্ধান পাঠান</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
