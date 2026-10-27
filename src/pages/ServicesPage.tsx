import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Layers, ArrowRight } from 'lucide-react';
import { getPublishedServices } from '../services/firestoreService';
import { Service } from '../types';
import { EmptyState } from '../components/EmptyState';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getPublishedServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Strategic Solutions
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">Full-Spectrum Agency Services</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Explore specialized digital services built to elevate your brand presence, acquire profitable customers, and automate your online infrastructure.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-6 transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  {service.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 group-hover:text-amber-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {service.shortDescription}
                </p>

                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Key Deliverables:
                    </span>
                    <ul className="mt-1 space-y-1">
                      {service.deliverables.slice(0, 3).map((d, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Timeline: {service.timeline || 'Flexible'}</span>
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform"
                >
                  <span>Scope & Pricing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No Services Match Your Search"
          description="There are currently no published agency services matching your criteria. Try adjusting your filters or contact us directly for custom engagements."
          actionText="Clear Search"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
          }}
        />
      )}

      {/* Custom Quote CTA */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Need a Specialized Multi-Channel Campaign?</h3>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          We construct tailored agency packages combining SEO, performance media, web engineering, and visual branding.
        </p>
        <Link
          to="/contact"
          className="inline-block px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-sm"
        >
          Request Custom Quotation
        </Link>
      </div>
    </div>
  );
};
