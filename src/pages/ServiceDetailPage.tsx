import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getServiceBySlug,
  getPublishedServices,
  getSubservicesByParent
} from '../services/firestoreService';
import { Service, SubService } from '../types';
import { LeadForm } from '../components/LeadForm';
import {
  Check,
  Clock,
  ShieldCheck,
  ArrowLeft,
  HelpCircle,
  Share2,
  Target,
  Compass,
  BarChart3,
  PenTool,
  Mail,
  Laptop,
  Layout,
  Palette,
  Sparkles,
  ShoppingBag,
  LineChart,
  Bot,
  MessageSquare,
  Layers,
  ArrowRight,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';
import { getServicePricingDisplay } from '../utils/pricing';

const ICON_MAP: Record<string, React.ElementType> = {
  Share2,
  Target,
  Compass,
  BarChart3,
  PenTool,
  Mail,
  Laptop,
  Layout,
  Palette,
  Sparkles,
  ShoppingBag,
  LineChart,
  Bot,
  MessageSquare,
  Layers,
};

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [subservices, setSubservices] = useState<SubService[]>([]);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getServiceBySlug(slug);
        setService(data);

        if (data) {
          // Document title for SEO
          if (data.seoTitle) {
            document.title = `${data.seoTitle} | Eagle Eye Digital`;
          } else {
            document.title = `${data.name} | Eagle Eye Digital Services`;
          }

          // Fetch subservices
          if (data.subservices && data.subservices.length > 0) {
            setSubservices(data.subservices);
          } else {
            const subs = await getSubservicesByParent(data.id);
            setSubservices(subs);
          }

          // Fetch related services in the same category
          const allPublished = await getPublishedServices();
          const related = allPublished
            .filter((s) => s.category === data.category && s.id !== data.id)
            .slice(0, 3);
          setRelatedServices(related);
        }
      } catch (err) {
        console.error('Failed to get service detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-32" />
        <div className="h-10 bg-slate-200 rounded w-2/3" />
        <div className="h-5 bg-slate-200 rounded w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-4 h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] mx-auto flex items-center justify-center">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#08152F]">Service Not Found</h2>
        <p className="text-sm text-[#667085] max-w-md mx-auto">
          The requested agency service either does not exist or has been relocated. Explore our comprehensive services catalog below.
        </p>
        <Link
          to="/services"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>
      </div>
    );
  }

  const IconComponent = (service.iconName && ICON_MAP[service.iconName]) || Layers;
  const pricing = getServicePricingDisplay(service);
  const activeSubservices = subservices.filter((s) => s.status !== 'inactive');

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-14 space-y-12 sm:space-y-16">
      
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-[#667085]">
        <Link to="/" className="hover:text-[#2563EB] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/services" className="hover:text-[#2563EB] transition-colors">
          Services
        </Link>
        <span>/</span>
        <span className="text-[#08152F] font-bold truncate max-w-xs">{service.name}</span>
      </nav>

      {/* 2. Hero Header & Information Banner */}
      <div className="bg-gradient-to-br from-[#08152F] via-[#1E293B] to-[#0A0F1D] border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden shadow-xl">
        {service.imageUrl ? (
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-sky-200">
                <span className="w-2 h-2 rounded-full bg-[#FFC629]" />
                <span>{service.category}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {service.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {service.shortDescription}
              </p>

              {/* Quick Metrics Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs font-semibold text-slate-200">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#FFC629]" />
                  <span>Timeline: {service.timeline || 'Tailored to requirements'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Commercial NDA & Direct Strategy Lead</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-sky-300" />
                  <span>Investment: <strong className="text-white">{pricing.displayText}</strong></span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 aspect-video lg:aspect-[4/3] group">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-sky-200">
                <span className="w-2 h-2 rounded-full bg-[#FFC629]" />
                <span>{service.category}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {service.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {service.shortDescription}
              </p>

              {/* Quick Metrics Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs font-semibold text-slate-200">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#FFC629]" />
                  <span>Timeline: {service.timeline || 'Tailored to requirements'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Commercial NDA & Direct Strategy Lead</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-sky-300" />
                  <span>Investment: <strong className="text-white">{pricing.displayText}</strong></span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Icon Visual */}
            <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 w-44 h-44 rounded-3xl bg-white/5 border border-white/10 items-center justify-center text-[#2563EB] shadow-2xl backdrop-blur-md">
              <IconComponent className="w-20 h-20 text-sky-300 opacity-90" />
            </div>
          </>
        )}
      </div>

      {/* 3. Main Content & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Full Details */}
        <div className="lg:col-span-8 space-y-10">

          {/* Dynamic Pricing Alert & Explanation */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Standard Engagement Investment
              </span>
              <div className="text-2xl font-black text-[#08152F] mt-0.5">
                {pricing.displayText}
              </div>
              <p className="text-xs text-[#667085] mt-1">
                {pricing.subtext}
              </p>
            </div>

            <a
              href={`#consultation-form`}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors shadow-sm text-center flex-shrink-0"
            >
              Request Scoped Proposal
            </a>
          </div>

          {/* Detailed Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#08152F] flex items-center space-x-2">
              <span>Service Architecture & Strategy</span>
            </h2>
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm text-sm text-[#08152F] leading-relaxed whitespace-pre-line">
              {service.longDescription || service.shortDescription}
            </div>
          </section>

          {/* Key Business Benefits */}
          {service.benefits && service.benefits.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#08152F]">Key Business Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm text-[#08152F] font-medium leading-relaxed">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Included Subservices (Comprehensive List) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#08152F]">Included Specialized Subservices</h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Every main service includes execution across these core technical capabilities.
                </p>
              </div>
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {activeSubservices.length} Subservices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeSubservices.map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="bg-white border border-slate-200 hover:border-[#2563EB]/60 rounded-2xl p-5 shadow-sm space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#08152F]">{sub.name}</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Capability" />
                  </div>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    {sub.shortDescription}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Deliverables & Scope of Work */}
          {(service.deliverables?.length || service.scopeOfWork?.length) && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#08152F]">Scope of Work & Deliverables</h2>
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
                
                {service.deliverables && service.deliverables.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-3">
                      Tangible Deliverables
                    </h3>
                    <ul className="space-y-2.5">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-[#08152F]">
                          <CheckCircle2 className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.scopeOfWork && service.scopeOfWork.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-3">
                      Process & Execution Steps
                    </h3>
                    <ul className="space-y-2.5">
                      {service.scopeOfWork.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-[#667085]">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* Service FAQs */}
          {service.faqs && service.faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#08152F]">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {service.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                    <h4 className="text-sm font-bold text-[#08152F] flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-[#667085] leading-relaxed pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Services in the Same Category */}
          {relatedServices.length > 0 && (
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-[#08152F]">Related {service.category} Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedServices.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/services/${rel.slug}`}
                    className="bg-white border border-slate-200 hover:border-[#2563EB] p-4 rounded-xl shadow-xs transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#08152F] hover:text-[#2563EB] transition-colors">
                        {rel.name}
                      </h4>
                      <p className="text-[11px] text-[#667085] mt-1 line-clamp-2">
                        {rel.shortDescription}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-[#2563EB] inline-flex items-center space-x-1 mt-3">
                      <span>Learn More</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Sticky Consultation CRM Form */}
        <div id="consultation-form" className="lg:col-span-4 sticky top-24 space-y-6">
          
          <LeadForm initialService={service.name} />

          {/* Direct WhatsApp Consultation Card */}
          <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-3 text-xs text-[#667085]">
            <h4 className="font-bold text-sm text-[#08152F]">Have a Custom Scope Question?</h4>
            <p className="leading-relaxed">
              Connect directly with our senior agency strategists on WhatsApp for quick scoping and quote estimates.
            </p>
            <a
              href={`https://wa.me/88${WHATSAPP_NUMBER}?text=Hi%20Eagle%20Eye%20Digital,%20I'm%20interested%20in%20your%20service:%20${encodeURIComponent(service.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors text-xs"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
