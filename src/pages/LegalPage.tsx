import React from 'react';

export const LegalPage: React.FC<{ type: 'privacy' | 'terms' | 'refund' | 'license' | 'faq' | 'support' }> = ({ type }) => {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Refund & Cancellation Policy',
    license: 'Digital Asset Licensing Policy',
    faq: 'Agency Frequently Asked Questions',
    support: 'Customer & Client Support Desk'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs uppercase tracking-widest text-[#2563EB] font-bold">
          Eagle Eye Digital Legal & Policies
        </span>
        <h1 className="text-3xl font-extrabold text-[#08152F] mt-1">{titles[type]}</h1>
        <p className="text-xs text-[#667085] mt-1">Last revised: October 2026 | Eagle Eye Digital</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-[#172033] leading-relaxed">
        {type === 'privacy' && (
          <>
            <h3 className="text-lg font-bold text-[#08152F]">1. Information Collection & Usage</h3>
            <p>
              Eagle Eye Digital collects client business details, email addresses, phone/WhatsApp numbers, and project specifications exclusively to deliver strategic marketing, web development, and digital services. We never sell or exchange client lists with third-party data brokers.
            </p>
            <h3 className="text-lg font-bold text-[#08152F]">2. Data Security & Encryption</h3>
            <p>
              All customer transmissions are encrypted using standard SSL/TLS and saved in Google Cloud Firestore with least-privilege security rules.
            </p>
          </>
        )}

        {type === 'terms' && (
          <>
            <h3 className="text-lg font-bold text-[#08152F]">1. Service Engagements & Retainers</h3>
            <p>
              All marketing retainers and project contracts are governed by mutual milestone approvals. Deliverables are specified in formal quotations prior to invoice generation.
            </p>
            <h3 className="text-lg font-bold text-[#08152F]">2. Intellectual Property Rights</h3>
            <p>
              Upon complete settlement of agreed contract fees, bespoke design and codebase deliverables belong entirely to the client, excluding proprietary pre-existing agency toolkits.
            </p>
          </>
        )}

        {type === 'refund' && (
          <>
            <h3 className="text-lg font-bold text-[#08152F]">1. Agency Services</h3>
            <p>
              Due to dedicated resource allocation, research hours, and ad spend execution, fees for completed milestone work are non-refundable. Cancellations prior to milestone kickoff are eligible for pro-rated account reconciliation.
            </p>
            <h3 className="text-lg font-bold text-[#08152F]">2. Digital Products</h3>
            <p>
              Because digital assets (Figma kits, code templates, documents) are instantly downloadable and non-returnable, sales are generally final unless a technical defect prevents file extraction.
            </p>
          </>
        )}

        {type === 'license' && (
          <>
            <h3 className="text-lg font-bold text-[#08152F]">1. Standard Commercial License</h3>
            <p>
              Permits use in unlimited personal or client commercial projects. You may not resell, sub-license, or redistribute raw source files as standalone templates.
            </p>
          </>
        )}

        {type === 'faq' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-bold text-[#08152F]">Do you guarantee specific sales or ROAS?</h4>
              <p className="text-xs text-[#667085] mt-1">
                No ethical agency can guarantee sales because variables such as product market fit, inventory, and supply chain remain under client control. We guarantee precision testing, ad optimization, and data-backed creative execution.
              </p>
            </div>
            <div>
              <h4 className="text-base font-bold text-[#08152F]">How do we communicate during active campaigns?</h4>
              <p className="text-xs text-[#667085] mt-1">
                We provide dedicated WhatsApp channels, scheduled strategy calls, and real-time project milestone tracking.
              </p>
            </div>
          </div>
        )}

        {type === 'support' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#08152F]">Need Technical or Commercial Assistance?</h3>
            <p>
              Our support team is available via email at <strong className="text-[#08152F]">Tamimnur908@gmail.com</strong> or via WhatsApp at <strong className="text-emerald-700 font-bold">01836126791</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
