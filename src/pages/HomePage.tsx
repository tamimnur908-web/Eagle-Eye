import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Flame,
  ChevronRight
} from 'lucide-react';
import {
  getPublishedServices,
  getPublishedProducts,
  getBentoConfig,
  defaultBentoConfig
} from '../services/firestoreService';
import { Service, DigitalProduct, BentoConfig } from '../types';
import { EmptyState } from '../components/EmptyState';
import { LeadForm } from '../components/LeadForm';

export const HomePage: React.FC = () => {
  const [bento, setBento] = useState<BentoConfig>(defaultBentoConfig);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bentoData, servicesData, productsData] = await Promise.all([
          getBentoConfig().catch(() => defaultBentoConfig),
          getPublishedServices().catch(() => []),
          getPublishedProducts().catch(() => [])
        ]);
        setBento(bentoData);
        setServices(servicesData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 space-y-12 sm:space-y-16">
      
      {/* 1. TOP HERO BENTO GRID (Dynamic From Admin Panel) */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Main Large Hero Banner (Left 7-8 columns) */}
          <div
            className="lg:col-span-8 rounded-3xl overflow-hidden relative min-h-[320px] sm:min-h-[420px] bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-8 sm:p-12 flex flex-col justify-between text-white shadow-lg group bg-cover bg-center"
            style={bento.heroBgImage ? { backgroundImage: `url(${bento.heroBgImage})` } : undefined}
          >
            {/* Ambient Background Wave & Grid Accent */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{bento.heroTag || 'Next-Gen Digital Agency & Products Hub'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {bento.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {bento.heroDescription}
              </p>
            </div>

            <div className="relative z-10 pt-6 flex flex-wrap items-center gap-3">
              <Link
                to={bento.heroBtn1Link || '/products'}
                className="px-6 py-3 rounded-full bg-white text-indigo-900 font-extrabold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md flex items-center space-x-2"
              >
                <span>{bento.heroBtn1Text || 'Browse Products'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={bento.heroBtn2Link || '/services'}
                className="px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all"
              >
                {bento.heroBtn2Text || 'Agency Services'}
              </Link>

              {/* Slider Dots */}
              <div className="ml-auto flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white transition-all cursor-pointer" />
                <span className="w-2 h-2 rounded-full bg-white/40 hover:bg-white transition-all cursor-pointer" />
                <span className="w-2 h-2 rounded-full bg-white/40 hover:bg-white transition-all cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Right Bento Column */}
          <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
            
            {/* Top Right Card: Social Growth & Media */}
            <div className="h-48 sm:h-52 rounded-3xl bg-slate-900 border border-slate-800 p-6 flex items-center justify-between overflow-hidden relative shadow-md group hover:border-indigo-500/50 transition-all">
              <div className="z-10 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                  {bento.card1Tag}
                </span>
                <h3 className="text-xl font-black text-white">{bento.card1Title}</h3>
                <p className="text-xs text-slate-400 max-w-[160px]">{bento.card1Description}</p>
                <Link
                  to={bento.card1LinkUrl || '/services'}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-sky-400 hover:text-sky-300 pt-1"
                >
                  <span>{bento.card1LinkText || 'Explore Retainers'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 3D App Icon Visual */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-400 flex items-center justify-center text-white font-black text-4xl shadow-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                {bento.card1IconText || 'in'}
              </div>
            </div>

            {/* Bottom Right Split Bento: Card 2 & Card 3 */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Terminal / Code Card */}
              <Link
                to={bento.card2LinkUrl || '/services'}
                className="rounded-3xl bg-black border border-slate-800 p-5 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-md min-h-[140px]"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div>
                  <p className="font-mono text-emerald-400 text-xs font-bold truncate">
                    {bento.card2Title}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {bento.card2Tag || bento.card2Description}
                  </span>
                </div>
              </Link>

              {/* AI & Digital Assets Card */}
              <Link
                to={bento.card3LinkUrl || '/products'}
                className="rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-slate-800 p-5 flex flex-col justify-between group hover:border-indigo-500 transition-all shadow-md min-h-[140px]"
              >
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                  {bento.card3Tag}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                    {bento.card3Title}
                  </h4>
                  <span className="text-[10px] text-indigo-400 font-semibold flex items-center space-x-0.5 mt-1">
                    <span>{bento.card3LinkText || 'View Assets'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. COLLECTIONS (Dynamic From Admin Panel) */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-indigo-600 font-black text-sm uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4" />
              <span>Collections</span>
            </span>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Big Rounded Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(bento.collections || []).map((col, idx) => (
            <Link
              key={idx}
              to={col.link || '/products'}
              className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-black border border-slate-800 hover:border-indigo-500 flex flex-col justify-between h-36 transition-all hover:-translate-y-1 shadow-lg group"
            >
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 group-hover:text-indigo-300 transition-colors">
                {col.tag}
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-white leading-tight group-hover:text-amber-400 transition-colors">
                  {col.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-1.5 text-amber-600 text-[11px] font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Trending Digital Products
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="h-44 sm:h-48 bg-slate-100 overflow-hidden relative">
                    <img
                      src={product.thumbnailUrl || '/logo.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 text-[10px] uppercase font-bold px-2 py-0.5 rounded text-indigo-700 border border-slate-200 shadow-sm">
                      {product.format || 'Digital Asset'}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm sm:text-base font-black text-slate-900">
                    {product.price === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      <>৳{product.salePrice ?? product.price}</>
                    )}
                  </div>
                  <Link
                    to={`/products/${product.slug}`}
                    className="px-3.5 py-1.5 rounded-full bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white text-xs font-bold transition-all shadow-sm"
                  >
                    View Asset
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="Digital Store Catalog Empty"
            description="No digital products or templates are published yet. Admins can upload UI kits, documents, or design assets via the admin portal."
            actionText="Go to Products Catalog"
            onAction={() => {
              window.location.href = '/products';
            }}
          />
        )}
      </section>

      {/* 4. AGENCY SERVICES */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Agency Execution
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Client Agency Services
            </h2>
          </div>
          <Link
            to="/services"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>All Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-6 transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Timeline: {service.timeline || 'Flexible'}</span>
                  <Link
                    to={`/services/${service.slug}`}
                    className="inline-flex items-center space-x-1 font-bold text-indigo-600 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Scope Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="No Services Published Yet"
            description="Our service catalog is currently being updated in the admin panel. Contact us directly for active service inquiries."
            actionText="Request Service Inquiry"
            onAction={() => {
              window.location.href = '#consultation';
            }}
          />
        )}
      </section>

      {/* 5. STRATEGY CONSULTATION CRM FORM */}
      <section id="consultation" className="max-w-4xl mx-auto w-full scroll-mt-24 pt-4">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Get In Touch
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Request a Consultation & Strategy Brief
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Connect directly with our senior growth strategists.
          </p>
        </div>

        <LeadForm />
      </section>

    </div>
  );
};
