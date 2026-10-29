import React, { useEffect, useState } from 'react';
import { getPublishedPortfolio } from '../services/firestoreService';
import { PortfolioItem } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Briefcase, ExternalLink } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await getPublishedPortfolio();
        setItems(data);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Proven Impact
        </span>
        <h1 className="text-4xl font-extrabold text-[#08152F]">Client Portfolio</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          Explore genuine creative and engineering deliverables completed for growing brands. We uphold strict transparency—no fabricated case studies or dummy metrics.
        </p>
      </div>

      {categories.length > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-4 py-2 rounded-lg border font-semibold transition-colors ${
                filter === cat
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#667085] border-slate-200 hover:text-[#172033] shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-[#2563EB] transition-all shadow-sm hover:shadow-md"
            >
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src={item.thumbnailUrl || '/logo.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-[#08152F]">{item.title}</h3>
                <p className="text-xs text-[#667085] line-clamp-3 leading-relaxed">{item.description}</p>
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline pt-2 transition-colors"
                  >
                    <span>View Project</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No Portfolio Items Published Yet"
          description="In compliance with our absolute no-demo-data policy, only genuine client projects approved for public showcase will appear here. Manage portfolio entries in the admin dashboard."
          actionText="Start a Project With Us"
          onAction={() => {
            window.location.href = '/contact';
          }}
        />
      )}
    </div>
  );
};
