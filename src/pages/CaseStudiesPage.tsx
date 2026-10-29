import React, { useEffect, useState } from 'react';
import { getPublishedCaseStudies } from '../services/firestoreService';
import { CaseStudy } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Target, CheckCircle } from 'lucide-react';

export const CaseStudiesPage: React.FC = () => {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const data = await getPublishedCaseStudies();
        setStudies(data);
      } catch (err) {
        console.error('Failed to load case studies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Strategic Evidence
        </span>
        <h1 className="text-4xl font-extrabold text-[#08152F]">Case Studies</h1>
        <p className="text-sm text-[#667085] leading-relaxed">
          Deep-dives into actual business challenges, our strategic intervention, execution roadmaps, and documented commercial results.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-slate-200 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : studies.length > 0 ? (
        <div className="space-y-8">
          {studies.map((cs) => (
            <div
              key={cs.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm hover:border-[#2563EB]/40 transition-colors"
            >
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                    Industry: {cs.clientIndustry}
                  </span>
                  <h3 className="text-2xl font-bold text-[#08152F] mt-1">{cs.title}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-[#F3F5F9] rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider">The Challenge</h4>
                  <p className="text-xs text-[#667085] leading-relaxed whitespace-pre-line">{cs.challenge}</p>
                </div>

                <div className="p-4 bg-[#F3F5F9] rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">The Strategy & Execution</h4>
                  <p className="text-xs text-[#667085] leading-relaxed whitespace-pre-line">{cs.strategy}</p>
                </div>

                <div className="p-4 bg-[#F3F5F9] rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Measured Results</h4>
                  <ul className="space-y-1.5 pt-1">
                    {cs.results.map((res, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 text-xs text-[#172033]">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No Case Studies Published Yet"
          description="We strictly publish authenticated, evidence-backed case studies. As newly authorized client releases are signed, comprehensive growth breakdowns will be published here."
          actionText="Inquire About Case Outcomes"
          onAction={() => {
            window.location.href = '/contact';
          }}
        />
      )}
    </div>
  );
};
