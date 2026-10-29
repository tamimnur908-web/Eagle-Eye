import React, { useState, useEffect } from 'react';
import { createLead, getPublishedServices } from '../services/firestoreService';
import { Service } from '../types';
import { Send, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface LeadFormProps {
  initialService?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ initialService = '' }) => {
  const { currentUser } = useAuth();
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

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || currentUser.email || '',
        name: prev.name || currentUser.displayName || ''
      }));
    }
  }, [currentUser]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.email || !formData.phoneOrWhatsApp || !formData.projectDescription) {
        throw new Error('Please fill out all required fields.');
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
        ...(currentUser?.uid ? { userId: currentUser.uid } : {})
      });

      setSuccess(true);
      setFormData({
        name: currentUser?.displayName || '',
        businessName: '',
        email: currentUser?.email || '',
        phoneOrWhatsApp: '',
        serviceInterest: 'Digital Marketing & Paid Ads',
        websiteOrSocial: '',
        budgetRange: '৳20,000 - ৳50,000 / month',
        deadline: '',
        projectDescription: '',
        preferredContactMethod: 'WhatsApp',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8">
      {success ? (
        <div className="text-center py-10 space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-2xl font-bold text-[#08152F]">Inquiry Received!</h3>
          <p className="text-[#667085] max-w-md mx-auto text-sm">
            Thank you for reaching out to Eagle Eye Digital. Our strategists will review your project details and contact you via your preferred method shortly.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="text-xs text-[#2563EB] font-semibold underline hover:text-[#1D4ED8]"
            >
              Submit another inquiry
            </button>
            <Link
              to="/account"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Track in My Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={`https://wa.me/88${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-b border-slate-200 pb-4 mb-4">
            <h3 className="text-xl font-bold text-[#08152F]">Request a Consultation & Quote</h3>
            <p className="text-xs text-[#667085] mt-1">
              Share your business targets and challenges. We craft data-backed marketing strategies tailored for scale.
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
                Your Name <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tamim Nur"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Business / Brand Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Apex Retail"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Email Address <span className="text-[#2563EB]">*</span>
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
                Phone / WhatsApp Number <span className="text-[#2563EB]">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneOrWhatsApp}
                onChange={(e) => setFormData({ ...formData, phoneOrWhatsApp: e.target.value })}
                placeholder="01XXXXXXXXX"
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Service Required
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
                    <option value="Social Media Management">Social Media Management</option>
                    <option value="Meta Ads Management">Meta Ads Management</option>
                    <option value="Google Ads Management">Google Ads Management</option>
                    <option value="Search Engine Optimization (SEO)">Search Engine Optimization (SEO)</option>
                    <option value="Website Design and Development">Website Design and Development</option>
                    <option value="E-commerce Website Development">E-commerce Website Development</option>
                    <option value="AI Workflow Automation">AI Workflow Automation</option>
                  </>
                )}
                <option value="Comprehensive Growth Retainer">Comprehensive Growth Retainer (Multi-Service)</option>
                <option value="Custom Consultation">Other / Custom Scope</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Estimated Budget Range
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              >
                <option value="Under ৳20,000">Under ৳20,000</option>
                <option value="৳20,000 - ৳50,000 / month">৳20,000 - ৳50,000 / month</option>
                <option value="৳50,000 - ৳150,000 / month">৳50,000 - ৳150,000 / month</option>
                <option value="৳150,000+ Enterprise">৳150,000+ Enterprise</option>
                <option value="Custom / Undetermined">Custom / Undetermined</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Current Website or Social Page URL
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
                Preferred Contact Method
              </label>
              <div className="flex space-x-4 pt-2">
                {(['WhatsApp', 'Email', 'Phone'] as const).map((method) => (
                  <label key={method} className="flex items-center space-x-1.5 text-xs text-[#172033] font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value={method}
                      checked={formData.preferredContactMethod === method}
                      onChange={() => setFormData({ ...formData, preferredContactMethod: method })}
                      className="accent-[#2563EB]"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Project Description & Goals <span className="text-[#2563EB]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              placeholder="Tell us about your brand, what you want to achieve, timeline constraints, or existing bottlenecks..."
              className="w-full bg-[#F3F5F9] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#FFC629] hover:bg-[#E5B01F] text-[#08152F] font-black text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-[#FFC629]/25 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <span>Submitting Inquiry...</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#08152F]" />
                <span>Submit Strategic Brief</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
