import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Layers,
  ArrowRight,
  CheckCircle2,
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
  ChevronRight,
  Filter,
  MessageCircle
} from 'lucide-react';
import { getPublishedServices, getAllServiceCategories } from '../services/firestoreService';
import { Service, ServiceCategory } from '../types';
import { EmptyState } from '../components/EmptyState';
import { getServicePricingDisplay } from '../utils/pricing';
import { WHATSAPP_NUMBER } from '../lib/firebase';

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

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const [servicesData, categoriesData] = await Promise.all([
          getPublishedServices(),
          getAllServiceCategories()
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServicesData();
  }, []);

  const categoryNames = useMemo(() => {
    const list = categories.map((c) => c.name);
    return ['All', ...list];
  }, [categories]);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        (s.subservices && s.subservices.some((sub) => sub.name.toLowerCase().includes(q)));
      const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [services, search, selectedCategory]);

  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return services.length;
    return services.filter((s) => s.category === catName).length;
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-16 space-y-12">
      
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold tracking-wide uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC629]" />
          <span>Strategic Agency Capabilities</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#08152F] tracking-tight">
          Full-Spectrum Agency Services
        </h1>
        <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-2xl mx-auto">
          From performance media and high-converting web platforms to AI automation and visual brand identities, Eagle Eye Digital fuels modern businesses with commercial velocity.
        </p>
      </div>

      {/* 2. Filter, Search, and Category Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-80 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services or subservices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F3F5F9] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categoryNames.map((cat) => {
              const count = getCategoryCount(cat);
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-[#08152F] text-white shadow-sm ring-1 ring-[#08152F]'
                      : 'bg-[#F3F5F9] text-[#667085] border border-slate-200/80 hover:bg-slate-100 hover:text-[#172033]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Active Filter Helper Bar */}
        {(search.trim() || selectedCategory !== 'All') && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#667085]">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>
                Showing <strong>{filteredServices.length}</strong> of <strong>{services.length}</strong> services
                {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
                {search.trim() && ` matching "${search}"`}
              </span>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              className="text-[#2563EB] font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const IconComponent = (service.iconName && ICON_MAP[service.iconName]) || Layers;
            const pricing = getServicePricingDisplay(service);
            const subservicesList = service.subservices || [];

            return (
              <div
                key={service.id}
                className="bg-white border border-slate-200 hover:border-[#2563EB] rounded-2xl p-6 transition-all group flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div className="space-y-4">
                  
                  {/* Top Image if provided, with category pill and icon overlay */}
                  {service.imageUrl ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 group/img">
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#08152F] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-slate-200/60">
                          {service.category}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200/60 text-[#2563EB] flex items-center justify-center shadow-sm">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    /* Category Pill & Icon (Default Clean Layout) */
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                        {service.category}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-[#2563EB] group-hover:border-[#2563EB] text-[#2563EB] group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {/* Title & Short Description */}
                  <div>
                    <h3 className="text-xl font-bold text-[#08152F] group-hover:text-[#2563EB] transition-colors leading-snug">
                      <Link to={`/services/${service.slug}`}>{service.name}</Link>
                    </h3>
                    <p className="text-xs text-[#667085] mt-2 line-clamp-3 leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>

                  {/* Subservices Snippet / Badge */}
                  {subservicesList.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-bold text-[#172033] uppercase tracking-wider text-[10px]">
                          Included Subservices:
                        </span>
                        <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                          {subservicesList.length} Specialized Areas
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {subservicesList.slice(0, 3).map((sub, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]"
                            title={sub.name}
                          >
                            {sub.name}
                          </span>
                        ))}
                        {subservicesList.length > 3 && (
                          <span className="text-[10px] text-[#2563EB] font-bold px-1 py-0.5">
                            +{subservicesList.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Benefits Preview */}
                  {service.benefits && service.benefits.length > 0 && (
                    <div className="pt-2">
                      <ul className="space-y-1">
                        {service.benefits.slice(0, 2).map((b, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5 text-xs text-[#667085]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                {/* Footer with Dynamic Pricing and CTA Link */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Investment:
                      </span>
                      <span
                        className={`text-sm font-black ${
                          pricing.hasExactPrice ? 'text-[#08152F]' : 'text-[#2563EB]'
                        }`}
                      >
                        {pricing.displayText}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#667085]">
                      {service.timeline || 'Flexible Scope'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <Link
                      to={`/services/${service.slug}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#2563EB] text-[#08152F] hover:text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>Explore Scope</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={`https://wa.me/88${WHATSAPP_NUMBER}?text=Hi%20Eagle%20Eye%20Digital,%20I'm%20interested%20in%20your%20service:%20${encodeURIComponent(service.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors flex items-center justify-center"
                      title="Direct WhatsApp Consultation"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No Services Match Your Search"
          description="There are currently no published agency services matching your selected filters. Try broadening your keywords or reach out directly for custom scopes."
          actionText="Clear All Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
          }}
        />
      )}

      {/* 4. Strategic Multi-Service Inquiry Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#08152F] via-[#0D2044] to-[#050E20] border border-[#112855] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC629]">
            Tailored Commercial Retainers
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Need an Integrated Multi-Channel Growth Engine?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We partner with enterprises to combine performance ads, custom web architecture, SEO authority, and automated CRM workflows into a cohesive commercial system.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-[#FFC629] hover:bg-[#E5B01F] text-[#08152F] font-black text-xs sm:text-sm transition-all shadow-md shadow-[#FFC629]/20"
            >
              Request Custom Quotation
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-colors"
            >
              How We Work
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

    </div>
  );
};
