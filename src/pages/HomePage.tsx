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
  Image as ImageIcon
} from 'lucide-react';
import {
  getPublishedServices,
  getPublishedProducts,
  getBentoConfig,
  defaultBentoConfig,
  defaultHeroSlides
} from '../services/firestoreService';
import { Service, DigitalProduct, BentoConfig, SlideVisualType, TextAnimationStyle } from '../types';
import { EmptyState } from '../components/EmptyState';
import { LeadForm } from '../components/LeadForm';

export const HomePage: React.FC = () => {
  const [bento, setBento] = useState<BentoConfig>(defaultBentoConfig);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const slides = bento.heroSlides && bento.heroSlides.length > 0
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
  const isPureBanner = activeSlide.isPureBanner || Boolean(activeSlide.bgImage && !activeSlide.title);

  // Dynamic Text Animation & Visual Modes
  const textAnimation: TextAnimationStyle = activeSlide.textAnimation || bento.defaultTextAnimation || 'typewriter';
  const animSpeed = activeSlide.textAnimationSpeed === 'fast' ? 18 : activeSlide.textAnimationSpeed === 'slow' ? 55 : 32;

  // Hybrid visual rotation state: cycles text -> 3d -> image every 2.4s if hybrid mode is active
  const [hybridModeIndex, setHybridModeIndex] = useState(0);
  useEffect(() => {
    if (activeSlide.visualType === 'hybrid') {
      const timer = setInterval(() => {
        setHybridModeIndex((prev) => (prev + 1) % 3);
      }, 2400);
      return () => clearInterval(timer);
    }
  }, [activeSlide.visualType, currentSlide]);

  // Smooth Typewriter effect whenever active slide changes
  const [typedTitle, setTypedTitle] = useState('');
  useEffect(() => {
    if (isPureBanner) return;
    const fullText = activeSlide.title || bento.heroTitle || 'Empower Your Growth With Intelligent Strategy';
    
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
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 space-y-12 sm:space-y-16">
      
      {/* 1. TOP HERO BENTO GRID (Dynamic From Admin Panel with Multi-Slide, Animated Typography & 3D Visual Support) */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Main Large Hero Banner with Smooth Sliding Carousel, Ken Burns effect & Floating Vectors */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden relative min-h-[380px] sm:min-h-[460px] bg-slate-950 flex flex-col justify-between text-white shadow-2xl group transition-all duration-700">
            
            {/* Animated Ken Burns Background Image with Crossfade */}
            <div
              key={`slide-bg-${currentSlide}`}
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out animate-ken-burns animate-slide-fade scale-100"
              style={
                activeSlide.bgImage
                  ? { backgroundImage: `url(${activeSlide.bgImage})` }
                  : bento.heroBgImage
                  ? { backgroundImage: `url(${bento.heroBgImage})` }
                  : { backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 50%, #0f172a 100%)' }
              }
            />

            {/* Glossy Light Sweep Beam across the banner image */}
            <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none animate-light-sweep z-10" />

            {/* If NOT pure banner, add ambient dark gradient and typography */}
            {!isPureBanner ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none z-10" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow z-10" />
                <div className="absolute -top-16 right-1/4 w-60 h-60 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none animate-pulse-glow z-10" />
              </>
            ) : (
              /* Subtle bottom gradient for indicator dots contrast */
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10" />
            )}

            {/* Clickable Destination Link when in Pure Banner Mode */}
            {isPureBanner && (
              <Link
                to={activeSlide.btn1Link || '/products'}
                className="absolute inset-0 z-10 cursor-pointer"
                title="View Destination"
              />
            )}

            {/* Previous / Next Slide Controls (Visible on Hover) */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 backdrop-blur-md shadow-xl"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 backdrop-blur-md shadow-xl"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Content Area when NOT a pure banner */}
            {!isPureBanner ? (
              <div className="p-8 sm:p-12 flex flex-col justify-between h-full relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-4 max-w-xl">
                    
                    {/* Pop-in Animated Tag Badge */}
                    <div
                      key={`tag-${currentSlide}`}
                      className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200 animate-pop-in shadow-lg"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                      <span className="bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-100 bg-clip-text text-transparent">
                        {activeSlide.tag || bento.heroTag || 'Eagle Eye Digital • Premium Highlights'}
                      </span>
                    </div>

                    {/* Animated Color-Shifting & Controlled Typography Headline */}
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight min-h-[72px] sm:min-h-[116px]">
                      <span
                        key={`title-${currentSlide}-${textAnimation}`}
                        className={`bg-clip-text text-transparent drop-shadow-sm transition-all ${
                          textAnimation === 'gradient'
                            ? 'bg-gradient-to-r from-amber-200 via-rose-300 to-cyan-300 animate-gradient-text'
                            : textAnimation === 'fade'
                            ? 'bg-gradient-to-r from-white via-slate-100 to-sky-200 animate-pop-in'
                            : textAnimation === 'bounce'
                            ? 'bg-gradient-to-r from-white via-amber-200 to-cyan-300 animate-pop-in'
                            : textAnimation === 'none'
                            ? 'bg-gradient-to-r from-white via-slate-100 to-sky-100'
                            : 'bg-gradient-to-r from-white via-amber-200 to-cyan-300 animate-gradient-text'
                        }`}
                      >
                        {textAnimation === 'typewriter'
                          ? typedTitle
                          : (activeSlide.title || bento.heroTitle || 'Empower Your Growth With Intelligent Strategy')}
                      </span>
                      {textAnimation === 'typewriter' && (
                        <span className="inline-block w-1 h-7 sm:h-10 ml-1.5 bg-amber-400 animate-pulse align-middle" />
                      )}
                    </h1>

                    {/* Smooth Fade-in Description */}
                    <p
                      key={`desc-${currentSlide}`}
                      className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg animate-pop-in"
                    >
                      {activeSlide.description || bento.heroDescription}
                    </p>
                  </div>

                  {/* 3D Floating Picture / Interactive Graphic / Text Terminal / Hybrid */}
                  <div className="md:col-span-4 hidden md:flex items-center justify-center relative">
                    {(() => {
                      const explicitType = activeSlide.visualType;
                      const currentVisualMode = explicitType === 'hybrid'
                        ? (hybridModeIndex === 0 ? 'text' : hybridModeIndex === 1 ? '3d' : 'image')
                        : explicitType || (activeSlide.image3D ? 'image' : '3d');

                      if (currentVisualMode === 'image') {
                        return (
                          <div
                            key={`visual-img-${currentSlide}-${hybridModeIndex}`}
                            className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden p-2.5 bg-white/10 backdrop-blur-md border border-white/25 shadow-2xl animate-pop-in animate-float group"
                          >
                            <img
                              src={
                                activeSlide.image3D ||
                                activeSlide.bgImage ||
                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
                              }
                              alt="Feature Graphic"
                              className="w-full h-full object-cover rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-white/20 pointer-events-none rounded-2xl" />
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-mono text-center text-sky-200 border border-white/10">
                              🎨 Feature Artwork
                            </div>
                          </div>
                        );
                      }

                      if (currentVisualMode === 'text') {
                        return (
                          <div
                            key={`visual-text-${currentSlide}-${hybridModeIndex}`}
                            className="relative w-52 h-48 lg:w-60 lg:h-52 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-indigo-500/35 shadow-2xl p-3.5 flex flex-col justify-between animate-pop-in animate-float"
                          >
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center space-x-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                              </div>
                              <span className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1">
                                <Terminal className="w-3 h-3 text-indigo-400" />
                                eagle:engine
                              </span>
                            </div>

                            {/* Terminal Body with Animated Code Line */}
                            <div className="font-mono text-[11px] space-y-1.5 text-left py-1">
                              <div className="text-emerald-400 font-bold flex items-center space-x-1">
                                <span className="text-slate-500">$</span>
                                <span className="text-amber-300">
                                  {activeSlide.terminalText || 'deploy --mode=scale'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300">
                                ⚡ <span className="text-cyan-400 font-semibold">Growth Strategy:</span> +320%
                              </div>
                              <div className="text-[10px] text-indigo-300">
                                📦 <span className="text-slate-400">Assets Loaded:</span> Verified 4K
                              </div>
                            </div>

                            {/* Terminal Footer Status Pill */}
                            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                ONLINE
                              </span>
                              <span className="text-slate-400 font-mono">v3.2 • ACTIVE</span>
                            </div>
                          </div>
                        );
                      }

                      // Default: '3d' (Floating 3D Orb with Badges)
                      return (
                        <div
                          key={`visual-3d-${currentSlide}-${hybridModeIndex}`}
                          className="relative w-48 h-48 lg:w-56 lg:h-56 flex items-center justify-center animate-pop-in"
                        >
                          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-600/40 via-indigo-500/30 to-amber-400/20 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl animate-float">
                            <div className="text-center space-y-1">
                              <Sparkles className="w-8 h-8 text-amber-300 mx-auto animate-pulse" />
                              <span className="text-[11px] font-black uppercase tracking-wider text-white block">
                                {activeSlide.badgeCenterText || 'Verified 4K'}
                              </span>
                            </div>
                          </div>

                          <div className="absolute -top-1 -left-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-amber-400/40 text-[10px] font-extrabold text-amber-300 shadow-xl animate-float flex items-center space-x-1.5">
                            <span>🚀</span>
                            <span>{activeSlide.badge1Text || 'Instant Deploy'}</span>
                          </div>

                          <div className="absolute -bottom-2 -right-2 px-3 py-1.5 rounded-xl bg-indigo-950/80 backdrop-blur-md border border-sky-400/40 text-[10px] font-extrabold text-sky-300 shadow-xl animate-float-reverse flex items-center space-x-1.5">
                            <span>⭐</span>
                            <span>{activeSlide.badge2Text || '4.9/5 Rating'}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Bottom Navigation & Indicator Dots */}
                <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={activeSlide.btn1Link || bento.heroBtn1Link || '/products'}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-500/25 flex items-center space-x-2 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>{activeSlide.btn1Text || bento.heroBtn1Text || 'Browse Products'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to={activeSlide.btn2Link || bento.heroBtn2Link || '/services'}
                      className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all transform hover:-translate-y-0.5"
                    >
                      {activeSlide.btn2Text || bento.heroBtn2Text || 'Agency Services'}
                    </Link>
                  </div>

                  {/* Multi-Slide Indicator Dots */}
                  {slides.length > 1 && (
                    <div className="flex items-center space-x-2 bg-slate-950/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-inner">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`transition-all duration-300 rounded-full ${
                            currentSlide === idx
                              ? 'w-7 h-2.5 bg-gradient-to-r from-amber-400 to-amber-300 shadow-md shadow-amber-400/50'
                              : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Pure Banner Mode: Clean, full image display with floating dots at the bottom */
              <div className="p-6 sm:p-8 flex items-end justify-between w-full h-full relative z-20 pointer-events-none mt-auto">
                <div className="pointer-events-auto">
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/15 flex items-center space-x-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Click to explore</span>
                  </span>
                </div>

                {slides.length > 1 && (
                  <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 shadow-xl pointer-events-auto">
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
                            ? 'w-7 h-2.5 bg-gradient-to-r from-amber-400 to-amber-300 shadow-md shadow-amber-400/50'
                            : 'w-2.5 h-2.5 bg-white/40 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Bento Column: 3 Side Cards (With 3D / Custom Picture Support) */}
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

              {/* Card 1: 3D Picture or App Icon Visual */}
              {bento.card1Image ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group-hover:scale-105 transition-transform flex-shrink-0 bg-slate-800">
                  <img src={bento.card1Image} alt="Card Visual" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-400 flex items-center justify-center text-white font-black text-4xl shadow-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                  {bento.card1IconText || 'in'}
                </div>
              )}
            </div>

            {/* Bottom Right Split Bento: Card 2 & Card 3 */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Card 2: Terminal / Custom Image Card */}
              <Link
                to={bento.card2LinkUrl || '/services'}
                className="rounded-3xl bg-black border border-slate-800 p-5 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-md min-h-[140px] overflow-hidden relative"
              >
                {bento.card2Image ? (
                  <div className="space-y-2">
                    <div className="w-full h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                      <img src={bento.card2Image} alt={bento.card2Title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-mono text-emerald-400 text-xs font-bold truncate">
                        {bento.card2Title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {bento.card2Tag || bento.card2Description}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </Link>

              {/* Card 3: AI & Digital Assets / Custom Image Card */}
              <Link
                to={bento.card3LinkUrl || '/products'}
                className="rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-slate-800 p-5 flex flex-col justify-between group hover:border-indigo-500 transition-all shadow-md min-h-[140px] overflow-hidden relative"
              >
                {bento.card3Image ? (
                  <div className="space-y-2">
                    <div className="w-full h-16 rounded-xl overflow-hidden bg-slate-900 border border-indigo-900">
                      <img src={bento.card3Image} alt={bento.card3Title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white truncate">
                        {bento.card3Title}
                      </h4>
                      <span className="text-[10px] text-indigo-400 font-semibold flex items-center space-x-0.5 mt-0.5">
                        <span>{bento.card3LinkText || 'View Assets'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
