import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Flame,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Code2,
  Box,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BarChart,
  Target,
  Share2,
  Laptop,
  Palette,
  Bot,
  MessageSquare,
  Compass,
  LineChart,
  HelpCircle,
  MessageCircle,
  Clock,
  ArrowUpRight,
  Heart
} from 'lucide-react';
import {
  getFeaturedServices,
  getPublishedServices,
  getPublishedProducts,
  getBentoConfig,
  getAllFAQs,
  getPublishedCaseStudies,
  defaultBentoConfig,
  defaultHeroSlides
} from '../services/firestoreService';
import {
  Service,
  DigitalProduct,
  BentoConfig,
  FAQ,
  CaseStudy,
  SlideVisualType,
  TextAnimationStyle
} from '../types';
import { LeadForm } from '../components/LeadForm';
import { useWishlist } from '../context/WishlistContext';
import { getServicePricingDisplay, getProductPricingDisplay } from '../utils/pricing';
import { WHATSAPP_NUMBER, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ICON_MAP: Record<string, React.ElementType> = {
  Share2,
  Target,
  Compass,
  Laptop,
  Palette,
  Bot,
  MessageSquare,
  LineChart,
  Layers,
  Sparkles,
  TrendingUp
};

export const HomePage: React.FC = () => {
  const [bento, setBento] = useState<BentoConfig>(() => {
    try {
      const cached = localStorage.getItem('eed_homepage_bento');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) return parsed;
      }
    } catch {}
    return defaultBentoConfig;
  });
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Real-time listener for homepage bento & slides
  useEffect(() => {
    try {
      const bentoDocRef = doc(db, 'settings', 'homepage_bento');
      const unsubscribe = onSnapshot(bentoDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const merged: BentoConfig = {
            ...defaultBentoConfig,
            ...data,
            heroSlides: Array.isArray(data.heroSlides) ? data.heroSlides : defaultHeroSlides
          };
          setBento(merged);
          try {
            localStorage.setItem('eed_homepage_bento', JSON.stringify(merged));
          } catch {}
        }
      }, (err) => {
        console.warn('Real-time bento listener notice:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error attaching bento snapshot listener:', e);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bentoData, featuredSrvs, productsData, faqsData, studiesData] =
          await Promise.all([
            getBentoConfig().catch(() => defaultBentoConfig),
            getFeaturedServices().catch(() => []),
            getPublishedProducts().catch(() => []),
            getAllFAQs().catch(() => []),
            getPublishedCaseStudies().catch(() => [])
          ]);
        setBento(bentoData);
        setFeaturedServices(featuredSrvs);
        setProducts(productsData);
        setFaqs(faqsData);
        setCaseStudies(studiesData);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slides =
    bento.heroSlides && bento.heroSlides.length > 0
      ? bento.heroSlides
      : defaultHeroSlides;

  // Auto-advance banner slides every 4.8 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[currentSlide] || slides[0] || defaultHeroSlides[0];
  const isPureBanner =
    activeSlide.isPureBanner || Boolean(activeSlide.bgImage && !activeSlide.title);

  // Dynamic Text Animation & Visual Modes
  const textAnimation: TextAnimationStyle =
    activeSlide.textAnimation || bento.defaultTextAnimation || 'typewriter';
  const animSpeed =
    activeSlide.textAnimationSpeed === 'fast'
      ? 18
      : activeSlide.textAnimationSpeed === 'slow'
      ? 55
      : 32;

  // Hybrid visual rotation state
  const [hybridModeIndex, setHybridModeIndex] = useState(0);
  useEffect(() => {
    if (activeSlide.visualType === 'hybrid') {
      const timer = setInterval(() => {
        setHybridModeIndex((prev) => (prev + 1) % 3);
      }, 2400);
      return () => clearInterval(timer);
    }
  }, [activeSlide.visualType, currentSlide]);

  // Typewriter effect
  const [typedTitle, setTypedTitle] = useState('');
  useEffect(() => {
    if (isPureBanner) return;
    const fullText =
      activeSlide.title ||
      bento.heroTitle ||
      'Empower Your Growth With Intelligent Strategy';

    if (textAnimation === 'typewriter') {
      setTypedTitle('');
      let idx = 0;
      const timer = setInterval(() => {
        idx++;
        setTypedTitle(fullText.slice(0, idx));
        if (idx >= fullText.length) {
          clearInterval(timer);
        }
      }, animSpeed);
      return () => clearInterval(timer);
    } else {
      setTypedTitle(fullText);
    }
  }, [currentSlide, activeSlide.title, bento.heroTitle, isPureBanner, textAnimation, animSpeed]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20">
      
      {/* ================= 1. TOP HERO BENTO GRID ================= */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Main Large Hero Banner with Smooth Sliding Carousel */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden relative min-h-[380px] sm:min-h-[460px] bg-[#08152F] flex flex-col justify-between text-white shadow-xs group transition-all duration-500 border border-[#0D2044]">
            
            {/* Animated Background Image */}
            <div
              key={`slide-bg-${currentSlide}`}
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out animate-ken-burns animate-slide-fade scale-100"
              style={
                activeSlide.bgImage
                  ? { backgroundImage: `url(${activeSlide.bgImage})` }
                  : bento.heroBgImage
                  ? { backgroundImage: `url(${bento.heroBgImage})` }
                  : { backgroundColor: '#08152F' }
              }
            />

            {!isPureBanner ? (
              <div className="absolute inset-0 bg-gradient-to-r from-[#08152F] via-[#08152F]/90 to-[#08152F]/50 pointer-events-none z-10" />
            ) : (
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08152F]/80 to-transparent pointer-events-none z-10" />
            )}

            {isPureBanner && (
              <Link
                to={activeSlide.btn1Link || '/services'}
                className="absolute inset-0 z-10 cursor-pointer"
                title="View Destination"
              />
            )}

            {/* Previous / Next Slide Controls */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#08152F]/70 hover:bg-[#08152F] border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 backdrop-blur-md shadow-xl"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#08152F]/70 hover:bg-[#08152F] border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 backdrop-blur-md shadow-xl"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Content Area */}
            {!isPureBanner ? (
              <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-between h-full relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                  <div className="md:col-span-8 space-y-4 max-w-xl">
                    
                    <div
                      key={`tag-${currentSlide}`}
                      className="inline-flex items-center space-x-2 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs font-semibold text-slate-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFC629]" />
                      <span className="truncate">
                        {activeSlide.tag || bento.heroTag || 'Eagle Eye Digital • Growth Engine'}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight min-h-0 sm:min-h-[84px] md:min-h-[110px]">
                      {textAnimation === 'typewriter'
                        ? typedTitle
                        : activeSlide.title || bento.heroTitle}
                      {textAnimation === 'typewriter' && (
                        <span className="inline-block w-1 h-6 sm:h-9 ml-1.5 bg-[#FFC629] animate-pulse align-middle" />
                      )}
                    </h1>

                    <p
                      key={`desc-${currentSlide}`}
                      className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-lg line-clamp-3 sm:line-clamp-none font-normal"
                    >
                      {activeSlide.description || bento.heroDescription}
                    </p>
                  </div>

                  {/* Clean Executive Visual Desk / Preview */}
                  <div className="md:col-span-4 hidden md:flex items-center justify-center relative">
                    {(() => {
                      const explicitType = activeSlide.visualType;
                      const currentVisualMode =
                        explicitType === 'hybrid'
                          ? hybridModeIndex === 0
                            ? 'text'
                            : hybridModeIndex === 1
                            ? '3d'
                            : 'image'
                          : explicitType || (activeSlide.image3D ? 'image' : '3d');

                      if (currentVisualMode === 'image') {
                        return (
                          <div
                            key={`visual-img-${currentSlide}-${hybridModeIndex}`}
                            className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden p-2 bg-[#050E20]/90 border border-slate-800 shadow-xl"
                          >
                            <img
                              src={
                                activeSlide.image3D ||
                                activeSlide.bgImage ||
                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
                              }
                              alt="Feature Graphic"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                        );
                      }

                      if (currentVisualMode === 'text') {
                        return (
                          <div
                            key={`visual-text-${currentSlide}-${hybridModeIndex}`}
                            className="relative w-52 h-48 lg:w-60 lg:h-52 rounded-2xl bg-[#050E20]/95 border border-slate-800 shadow-xl p-4 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                                <span className="w-2 h-2 rounded-full bg-[#FFC629] inline-block" />
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                                <Terminal className="w-3 h-3 text-[#2563EB]" />
                                eagle:agency
                              </span>
                            </div>

                            <div className="font-mono text-xs space-y-1.5 text-left py-1">
                              <div className="text-emerald-400 font-bold flex items-center space-x-1">
                                <span className="text-slate-500">$</span>
                                <span className="text-white">
                                  {activeSlide.terminalText || 'deploy --agency=scale'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-300">
                                • <span className="text-white font-semibold">Services:</span> 14 Active
                              </div>
                              <div className="text-[11px] text-slate-300">
                                • <span className="text-white font-semibold">Subservices:</span> 144 Scopes
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                VERIFIED
                              </span>
                              <span className="text-slate-400 font-mono">v4.0 • READY</span>
                            </div>
                          </div>
                        );
                      }

                      // Default Minimal Executive Desk
                      return (
                        <div
                          key={`visual-default-${currentSlide}-${hybridModeIndex}`}
                          className="relative w-full max-w-[260px] rounded-2xl bg-[#050E20]/90 border border-slate-800 p-5 space-y-3.5 shadow-xl text-left"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Agency Highlights
                            </span>
                            <span className="text-[10px] font-mono text-[#FFC629] font-bold">PRO</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-300">
                              <span>Agency Services</span>
                              <span className="font-bold text-white">14 Active</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                              <span>Specialized Scopes</span>
                              <span className="font-bold text-white">144 Included</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                              <span>Client Engagement</span>
                              <span className="font-bold text-[#FFC629]">Bespoke Retainer</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Operational Model</span>
                            <span className="text-emerald-400 font-bold">Open for Scopes</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Bottom Navigation & Indicator Dots */}
                <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <Link
                      to="/services"
                      className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
                    >
                      <span>Explore Agency Services</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/contact"
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center"
                    >
                      Book Strategy Call
                    </Link>
                  </div>

                  {slides.length > 1 && (
                    <div className="flex items-center justify-center space-x-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 self-center sm:self-auto">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`transition-all duration-300 rounded-full ${
                            currentSlide === idx
                              ? 'w-6 h-2 bg-[#FFC629]'
                              : 'w-2 h-2 bg-white/40 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 flex items-end justify-between w-full h-full relative z-20 pointer-events-none mt-auto">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 border border-white/15 flex items-center space-x-1.5 shadow-sm pointer-events-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFC629]" />
                  <span>Click to explore</span>
                </span>

                {slides.length > 1 && (
                  <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15 shadow-sm pointer-events-auto">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSlide(idx);
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full ${
                          currentSlide === idx
                            ? 'w-6 h-2 bg-[#FFC629]'
                            : 'w-2 h-2 bg-white/40 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Bento Column: 3 Side Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            
            <div className="h-auto min-h-[140px] sm:h-52 rounded-2xl bg-[#08152F] border border-[#0D2044] p-5 sm:p-6 flex items-center justify-between overflow-hidden relative shadow-xs group hover:border-[#2563EB] transition-colors">
              <div className="z-10 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FFC629]">
                  {bento.card1Tag || 'Performance Media'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">{bento.card1Title || 'Meta & Google Ads'}</h3>
                <p className="text-xs text-slate-300 max-w-[160px] leading-relaxed">{bento.card1Description || 'Precision audience targeting scaling direct returns.'}</p>
                <Link
                  to={bento.card1LinkUrl || '/services'}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#60A5FA] hover:text-white pt-1 transition-colors"
                >
                  <span>{bento.card1LinkText || 'Explore Retainers'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {bento.card1Image ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-700/80 shadow-sm flex-shrink-0 bg-slate-800">
                  <img src={bento.card1Image} alt="Card Visual" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#0D2044] border border-[#112855] text-[#2563EB] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Target className="w-9 h-9 sm:w-10 sm:h-10" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 flex-1">
              <Link
                to={bento.card2LinkUrl || '/services'}
                className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between group hover:border-[#2563EB] transition-colors shadow-xs min-h-[140px]"
              >
                <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                  {bento.card2Tag || 'Custom Platforms'}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#08152F] leading-snug">
                    {bento.card2Title || 'Web Engineering'}
                  </h4>
                  <span className="text-xs font-semibold text-[#2563EB] flex items-center space-x-0.5 mt-2">
                    <span>View Stack</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>

              <Link
                to={bento.card3LinkUrl || '/services'}
                className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between group hover:border-[#2563EB] transition-colors shadow-xs min-h-[140px]"
              >
                <span className="text-[10px] font-bold text-[#FFC629] uppercase tracking-wider">
                  {bento.card3Tag || 'AI & Workflows'}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#08152F] leading-snug">
                    {bento.card3Title || 'Chatbots & Automation'}
                  </h4>
                  <span className="text-xs font-semibold text-[#2563EB] flex items-center space-x-0.5 mt-2">
                    <span>{bento.card3LinkText || 'View Capabilities'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 2. SHORT AGENCY INTRODUCTION ================= */}
      <section className="w-full bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 md:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB]">
              Who We Are
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#08152F] tracking-tight leading-tight">
              A Modern Commercial Agency Built for Growth & Execution
            </h2>
            <p className="text-sm text-[#667085] leading-relaxed">
              Eagle Eye Digital is a full-service digital agency bridging strategic marketing, bespoke web engineering, creative brand systems, and intelligent business automations. We focus on measurable business expansion, transparent operational standards, and resilient technical execution.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#172033]">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                <span>14 Full Agency Services</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#172033]">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                <span>144 Specialized Subservices</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#172033]">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                <span>Zero Hardcoded Constraints</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#F3F5F9] border border-slate-200 text-center space-y-1">
              <span className="text-3xl font-black text-[#08152F]">3</span>
              <span className="text-xs font-bold text-[#2563EB] block">Core Disciplines</span>
              <p className="text-[10px] text-[#667085]">Marketing • Tech • AI</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#F3F5F9] border border-slate-200 text-center space-y-1">
              <span className="text-3xl font-black text-[#08152F]">100%</span>
              <span className="text-xs font-bold text-[#2563EB] block">Dashboard Managed</span>
              <p className="text-[10px] text-[#667085]">Dynamic In Real Time</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#F3F5F9] border border-slate-200 text-center space-y-1">
              <span className="text-3xl font-black text-[#08152F]">24/7</span>
              <span className="text-xs font-bold text-[#2563EB] block">Inquiry Routing</span>
              <p className="text-[10px] text-[#667085]">WhatsApp & CRM Sync</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#F3F5F9] border border-slate-200 text-center space-y-1">
              <span className="text-3xl font-black text-[#08152F]">Clear</span>
              <span className="text-xs font-bold text-[#2563EB] block">Transparent Scopes</span>
              <p className="text-[10px] text-[#667085]">Price on Request & Fixed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. FEATURED AGENCY SERVICES ================= */}
      <section className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC629]" />
              <span>Tailored Engagements</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#08152F] mt-1">
              Featured Agency Services
            </h2>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>View All 14 Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => {
              const IconComp = (service.iconName && ICON_MAP[service.iconName]) || Layers;
              const pricing = getServicePricingDisplay(service);
              const subs = service.subservices || [];

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
                          <IconComp className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      /* Category Pill & Icon (Default Clean Layout) */
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {service.category}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-[#2563EB] group-hover:border-[#2563EB] text-[#2563EB] group-hover:text-white flex items-center justify-center transition-all">
                          <IconComp className="w-5 h-5" />
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-bold text-[#08152F] group-hover:text-[#2563EB] transition-colors">
                        <Link to={`/services/${service.slug}`}>{service.name}</Link>
                      </h3>
                      <p className="text-xs text-[#667085] mt-2 line-clamp-2 leading-relaxed">
                        {service.shortDescription}
                      </p>
                    </div>

                    {subs.length > 0 && (
                      <div className="pt-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Capabilities: </span>
                        <span>{subs.slice(0, 3).map((s) => s.name).join(' • ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Investment:
                      </span>
                      <span className={`font-black ${pricing.hasExactPrice ? 'text-[#08152F]' : 'text-[#2563EB]'}`}>
                        {pricing.displayText}
                      </span>
                    </div>

                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center space-x-1 font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform"
                    >
                      <span>Explore Scope</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-[#667085]">
            Loading agency services catalog...
          </div>
        )}
      </section>

      {/* ================= 4. SERVICE CATEGORIES OVERVIEW ================= */}
      <section className="w-full space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Organized Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08152F]">
            Explore by Service Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link
            to="/services"
            className="rounded-2xl p-7 bg-[#08152F] border border-[#0D2044] text-white space-y-4 hover:border-[#2563EB] transition-colors group shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#0D2044] border border-[#112855] text-[#2563EB] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC629]">
                Category A
              </span>
              <h3 className="text-xl font-bold group-hover:text-white transition-colors">
                Digital Marketing
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Social media retainers, Meta & Google ad management, comprehensive SEO, email marketing, and content marketing.
              </p>
            </div>
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#60A5FA] group-hover:text-white transition-colors pt-2">
              <span>View 6 Services (63 Subservices)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/services"
            className="rounded-2xl p-7 bg-[#08152F] border border-[#0D2044] text-white space-y-4 hover:border-[#2563EB] transition-colors group shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#0D2044] border border-[#112855] text-[#2563EB] flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC629]">
                Category B
              </span>
              <h3 className="text-xl font-bold group-hover:text-white transition-colors">
                Web Development & Creative
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Corporate web engineering, high-converting landing pages, UI/UX systems in Figma, e-commerce, and conversion tracking.
              </p>
            </div>
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#60A5FA] group-hover:text-white transition-colors pt-2">
              <span>View 6 Services (66 Subservices)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/services"
            className="rounded-2xl p-7 bg-[#08152F] border border-[#0D2044] text-white space-y-4 hover:border-[#2563EB] transition-colors group shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#0D2044] border border-[#112855] text-[#2563EB] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC629]">
                Category C
              </span>
              <h3 className="text-xl font-bold group-hover:text-white transition-colors">
                AI and Business Automation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                AI workflow automations, CRM synchronization, repetitive task elimination, and 24/7 customer support chatbots.
              </p>
            </div>
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#60A5FA] group-hover:text-white transition-colors pt-2">
              <span>View 2 Services (20 Subservices)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

        </div>
      </section>

      {/* ================= 5. HOW WE WORK (AGENCY PROCESS) ================= */}
      <section className="w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Systematic Delivery
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08152F]">
            How We Execute Projects
          </h2>
          <p className="text-xs text-[#667085]">
            A predictable, milestone-driven framework delivering quality at every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] font-black text-xs flex items-center justify-center">
              01
            </span>
            <h4 className="text-base font-bold text-[#08152F]">Discovery & Audit</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              We deconstruct your market positioning, commercial goals, competitor landscape, and existing technical assets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] font-black text-xs flex items-center justify-center">
              02
            </span>
            <h4 className="text-base font-bold text-[#08152F]">Strategy & Design</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              We architect the technical blueprint, audience funnels, Figma interfaces, and campaign creative directions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] font-black text-xs flex items-center justify-center">
              03
            </span>
            <h4 className="text-base font-bold text-[#08152F]">Engineering & Launch</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              We deploy clean frontend code, configure tracking pixels, launch targeted ad sets, and initiate live monitoring.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] font-black text-xs flex items-center justify-center">
              04
            </span>
            <h4 className="text-base font-bold text-[#08152F]">Optimization & Scale</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              We refine conversion rates, automate CRM handovers, optimize ad spend, and report verifiable commercial metrics.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 6. KEY BENEFITS / WHY CHOOSE US ================= */}
      <section className="w-full bg-[#F3F5F9] rounded-2xl p-8 sm:p-12 border border-slate-200/80 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Proven Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08152F]">
            Why Brands Choose Eagle Eye Digital
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#08152F]">Commercial Velocity</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              We eliminate unnecessary agency bloat and focus squarely on deliverables that acquire customers and scale revenue.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#08152F]">Strict Technical Rigor</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Clean TypeScript architecture, resilient cloud databases, and proper API security ensure your brand is protected.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <BarChart className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#08152F]">Radical Transparency</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              No hidden fees, no ambiguous reports. Every campaign and project is backed by live data you can independently verify.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 7. CASE STUDIES (ONLY WHEN GENUINE CONTENT EXISTS) ================= */}
      {caseStudies.length > 0 && (
        <section className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                Verified Outcomes
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#08152F] mt-1">
                Client Case Studies
              </h2>
            </div>
            <Link
              to="/case-studies"
              className="text-xs sm:text-sm font-bold text-[#2563EB] flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caseStudies.map((cs) => (
              <div key={cs.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase text-[#2563EB]">{cs.clientIndustry}</span>
                <h3 className="text-lg font-bold text-[#08152F]">{cs.title}</h3>
                <p className="text-xs text-[#667085] line-clamp-2">{cs.challenge}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {(cs.results || []).map((r, rIdx) => (
                    <span key={rIdx} className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= 8. DIGITAL PRODUCTS CATALOG SECTION ================= */}
      <section className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Digital Store</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#08152F] mt-1">
              Digital Products & UI Vault
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-[#2563EB] flex items-center space-x-1"
          >
            <span>Browse Vault</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const pricing = getProductPricingDisplay(product);
              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 hover:border-[#2563EB] rounded-2xl overflow-hidden transition-all group flex flex-col justify-between shadow-sm"
                >
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={product.thumbnailUrl || '/logo.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                      }}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
                        isInWishlist(product.id)
                          ? 'bg-rose-50 text-rose-500 border border-rose-200'
                          : 'bg-white/90 text-slate-500 hover:text-rose-500 border border-slate-200'
                      }`}
                      title={isInWishlist(product.id) ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase">{product.category}</span>
                    <h4 className="text-sm font-bold text-[#08152F] line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-[#667085] line-clamp-2">{product.description}</p>
                  </div>
                  <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-[#08152F]">{pricing.displayText}</span>
                    <Link
                      to={`/products/${product.slug}`}
                      className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold hover:bg-[#2563EB] hover:text-white transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Attractive agency-focused empty state (per Requirement 9) */
          <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-10 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-[#08152F]">Digital Products Vault Upcoming</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Our curated UI kits, graphic design templates, and software utilities are currently preparing for public release. Meanwhile, our full agency retainers are live and taking client inquiries.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Explore Agency Services
              </Link>
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#08152F] text-xs font-bold transition-colors"
              >
                Inquire for Custom Work
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ================= 9. FREQUENTLY ASKED QUESTIONS ================= */}
      <section className="w-full space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08152F]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {(faqs.length > 0 ? faqs : [
            {
              id: 'f1',
              question: 'How do agency service engagements typically start?',
              answer: 'We begin with an initial discovery consultation where we audit your target market and requirements, then provide a structured scope and timeline.',
              sortOrder: 1
            },
            {
              id: 'f2',
              question: 'Are service prices fixed or customized to requirements?',
              answer: 'We offer both transparent fixed scopes and customized retainers labeled "Price on Request" tailored specifically to your campaign volume and deliverables.',
              sortOrder: 2
            },
            {
              id: 'f3',
              question: 'Can we combine multiple services into a single retainer?',
              answer: 'Yes. Most growth clients choose our Comprehensive Growth Retainer combining performance media, bespoke web development, and AI workflow automations.',
              sortOrder: 3
            },
            {
              id: 'f4',
              question: 'How do you communicate project updates and progress?',
              answer: 'We maintain dedicated communication via WhatsApp, email, scheduled review meetings, and live reporting dashboards for complete clarity.',
              sortOrder: 4
            }
          ]).slice(0, 6).map((faq, idx) => (
            <div key={faq.id || idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
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

      {/* ================= 10. PROJECT INQUIRY & LEAD CRM SECTION ================= */}
      <section id="consultation" className="max-w-4xl mx-auto w-full scroll-mt-24 pt-4">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Initiate Engagement
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08152F]">
            Request a Consultation & Strategy Brief
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Connect directly with our senior agency strategists. We reply within one business day.
          </p>
        </div>

        <LeadForm />
      </section>

      {/* Direct WhatsApp Callout */}
      <div className="max-w-xl mx-auto text-center space-y-2 text-xs text-[#667085]">
        <span>Prefer immediate communication? </span>
        <a
          href={`https://wa.me/88${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 font-bold hover:underline inline-flex items-center space-x-1"
        >
          <MessageCircle className="w-3.5 h-3.5 inline" />
          <span>Chat directly on WhatsApp (01836126791)</span>
        </a>
      </div>

    </div>
  );
};
