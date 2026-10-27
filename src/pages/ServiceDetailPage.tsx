import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getServiceBySlug } from '../services/firestoreService';
import { Service } from '../types';
import { LeadForm } from '../components/LeadForm';
import { Check, Clock, ShieldCheck, ArrowLeft, HelpCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) return;
      try {
        const data = await getServiceBySlug(slug);
        setService(data);
      } catch (err) {
        console.error('Failed to get service detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Service Not Found</h2>
        <p className="text-sm text-slate-600">The requested service either does not exist or has not been published yet.</p>
        <Link to="/services" className="inline-block px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm">
          Back to All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/services" className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-amber-600">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Services</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">
            <span>{service.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {service.name}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            {service.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-slate-600 border-y border-slate-200 py-3">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Timeline: {service.timeline || 'Tailored to scope'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Standard NDA & Quality Guarantee</span>
            </div>
          </div>

          {/* Long Description / Overview */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-900">Service Overview</h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              {service.longDescription || service.shortDescription}
            </div>
          </div>

          {/* Deliverables & Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {service.deliverables && service.deliverables.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  Deliverables Included
                </h4>
                <ul className="space-y-2">
                  {service.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.benefits && service.benefits.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  Expected Business Impact
                </h4>
                <ul className="space-y-2">
                  {service.benefits.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pricing Packages */}
          {service.pricingPackages && service.pricingPackages.length > 0 && (
            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-bold text-slate-900">Configurable Packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.pricingPackages.map((pkg, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
                    <h5 className="text-base font-bold text-slate-900">{pkg.name}</h5>
                    <div className="text-xl font-extrabold text-amber-600">
                      ৳{pkg.price}{' '}
                      <span className="text-xs text-slate-500 font-normal">/ {pkg.billingType}</span>
                    </div>
                    {pkg.features && (
                      <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                        {pkg.features.map((f, fIdx) => (
                          <li key={fIdx} className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service FAQs */}
          {service.faqs && service.faqs.length > 0 && (
            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {service.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{faq.question}</span>
                    </h5>
                    <p className="text-xs text-slate-600 mt-2 pl-5">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Consultation Form */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <LeadForm initialService={service.name} />

          <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-900">Prefer to talk directly?</span>
            <p>Our strategists are ready on WhatsApp for rapid scope discussion.</p>
            <a
              href={`https://wa.me/88${WHATSAPP_NUMBER}?text=Hi%20Eagle%20Eye%20Digital,%20I'm%20interested%20in%20your%20service:%20${encodeURIComponent(service.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-2.5 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
