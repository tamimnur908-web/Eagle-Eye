import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { LeadForm } from '../components/LeadForm';
import { Mail, MessageSquare, Clock, Shield } from 'lucide-react';
import { WHATSAPP_NUMBER, BUSINESS_EMAIL } from '../lib/firebase';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || '';
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Start The Conversation
        </span>
        <h1 className="text-4xl font-extrabold text-[#08152F]">Contact & Consultation</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          Whether you need a performance marketing retainer, a new custom web application, or a tailored agency quotation, our team is at your disposal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-[#08152F]">Direct Agency Lines</h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm">
                <Mail className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#667085] block font-medium">Business Inquiries</span>
                  <a href={`mailto:${BUSINESS_EMAIL}`} className="text-[#08152F] hover:text-[#2563EB] font-semibold transition-colors">
                    {BUSINESS_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <MessageSquare className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#667085] block font-medium">WhatsApp Strategic Desk</span>
                  <a
                    href={`https://wa.me/88${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    +880 {WHATSAPP_NUMBER}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Clock className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#667085] block font-medium">Operational Hours</span>
                  <span className="text-[#08152F] font-semibold">Saturday - Thursday: 10:00 AM - 8:00 PM (GMT+6)</span>
                  <p className="text-xs text-[#667085] mt-0.5">Emergency retainer support monitored 24/7</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/60 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#08152F]">
                <Shield className="w-4 h-4 text-[#2563EB]" />
                <span>Client Data Confidentiality</span>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                All client submissions and project discussions are covered by default standard confidentiality agreements. We never share your marketing metrics or lead lists.
              </p>
            </div>
          </div>
        </div>

        {/* Lead Generation Form */}
        <div className="lg:col-span-7">
          <LeadForm initialService={initialService} />
        </div>
      </div>

    </div>
  );
};
