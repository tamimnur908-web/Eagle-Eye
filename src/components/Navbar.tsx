import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { UserAvatar } from './UserAvatar';
import {
  Search,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Heart,
  Menu,
  X,
  MessageCircle
} from 'lucide-react';
import { SocialIcon } from './SocialIcon';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { settings, headerConfig, socialLinks } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price ?? 0),
    0
  );

  const headerSocials = (socialLinks || []).filter(
    (s) => s.isActive && s.showInHeader && Boolean(s.url?.trim())
  );
  const navItems = headerConfig?.navLinks && headerConfig.navLinks.length > 0
    ? headerConfig.navLinks
    : [
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/products' },
        { label: 'Services', path: '/services' },
        { label: 'Portfolio', path: '/portfolio' },
        { label: 'Case Studies', path: '/case-studies' },
        { label: 'About', path: '/about' },
        { label: 'Our Contacts', path: '/contact' },
      ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setAccountDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'All Agency Services', path: '/services' },
    { name: 'Digital Marketing Services', path: '/services' },
    { name: 'Web Development & Creative', path: '/services' },
    { name: 'AI & Business Automation', path: '/services' },
    { name: 'Digital Products Store', path: '/products' },
    { name: 'Portfolio & Case Studies', path: '/case-studies' }
  ];

  const agencyServiceCategories = [
    {
      title: 'Digital Marketing',
      desc: 'Social media, Meta & Google ads, SEO, email & content',
      path: '/services'
    },
    {
      title: 'Web Development and Creative Services',
      desc: 'Custom business websites, e-commerce, UI/UX, and branding',
      path: '/services'
    },
    {
      title: 'AI and Business Automation',
      desc: 'Smart workflows, lead routing, and customer support chatbots',
      path: '/services'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm w-full">
      {/* Dynamic Top Announcement Bar (Header Config) */}
      {headerConfig?.showAnnouncement && headerConfig?.announcementText && (
        <div className="bg-gradient-to-r from-[#08152F] via-[#0D2044] to-[#08152F] text-white text-[11px] sm:text-xs py-2 px-4 text-center font-bold tracking-wide relative z-50 flex items-center justify-center space-x-2 shadow-sm border-b border-[#112855]">
          <span>{headerConfig.announcementText}</span>
          {headerConfig.announcementLink && (
            <Link
              to={headerConfig.announcementLink}
              className="underline text-[#FFC629] hover:text-[#FFD359] ml-1.5 transition-colors font-extrabold"
            >
              Explore Now →
            </Link>
          )}
        </div>
      )}

      {/* Top Main Bar (Vyrqonix Style) */}
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 group">
            <img
              src={settings.logoUrl || '/logo.jpg'}
              alt={settings.brandName || 'Eagle Eye Digital'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.jpg';
              }}
              className="h-8 sm:h-11 w-auto max-w-[105px] sm:max-w-[140px] object-contain rounded-lg border border-slate-200 p-0.5 group-hover:border-[#2563EB] transition-colors shadow-xs"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-2xl font-black tracking-tight text-[#08152F] group-hover:text-[#2563EB] transition-colors leading-none">
                {settings.brandName || 'EAGLE EYE'}
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest text-[#2563EB] font-extrabold uppercase mt-0.5">
                {settings.tagline || 'YOUR DIGITAL WORLD'}
              </span>
            </div>
          </Link>

          {/* Central Rounded Search Bar with Action Pill (Like Vyrqonix) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-6 relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full h-11 pl-5 pr-12 rounded-full border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none text-xs sm:text-sm text-[#172033] bg-white transition-all shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-8 h-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center transition-colors shadow-xs"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Side: Header Socials & WhatsApp Chat Support Pill (Desktop), Mobile Actions (Mobile) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-shrink-0">
            {/* Header Social Icons (If Enabled in Placement) */}
            {headerSocials.length > 0 && (
              <div className="hidden xl:flex items-center space-x-1.5 border-r border-slate-200 pr-3">
                {headerSocials.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-[#2563EB] text-[#667085] hover:text-[#2563EB] flex items-center justify-center transition-colors"
                    title={item.platform}
                  >
                    <SocialIcon link={item} size={15} />
                  </a>
                ))}
              </div>
            )}

            {/* Dynamic WhatsApp Chat Support Pill (Vyrqonix style in Row 1) */}
            {headerConfig?.showChatSupport !== false && (
              <a
                href={`https://wa.me/88${(headerConfig?.chatSupportNumber || settings.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-emerald-50/50 transition-colors group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs">
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-[#172033] font-bold leading-tight">
                    {headerConfig?.chatSupportText || 'Chat Support'}
                  </span>
                  <span className="text-xs font-black text-[#10B981] leading-tight">
                    {headerConfig?.chatSupportNumber || settings.whatsappNumber || '01836126791'}
                  </span>
                </div>
              </a>
            )}

            {/* Mobile Actions: Compact Cart & User Icon on Small Screens Only */}
            <Link
              to="/cart"
              className="lg:hidden flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-[#7C3AED] text-white font-bold text-xs shadow-xs"
              title="Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{cart.length}</span>
            </Link>

            <Link
              to="/account"
              className="lg:hidden p-1 rounded-full border border-slate-200 text-[#172033]"
              title="Account"
            >
              {currentUser ? (
                <UserAvatar user={currentUser} size="sm" />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-600" />
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 text-[#172033] lg:hidden hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full h-10 pl-4 pr-12 rounded-full border border-slate-300 text-xs text-[#172033] bg-[#F3F5F9] focus:outline-none focus:border-[#2563EB]"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Sub Header Navigation Bar (Desktop Only: All Categories Pill + Nav Links + Right Wishlist, Account, Cart Pill) */}
      <div className="hidden lg:block w-full px-4 sm:px-8 lg:px-12 xl:px-16 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: "All Categories" Purple Pill Button + Nav Items */}
          <div className="flex items-center space-x-4 xl:space-x-6">
            {/* "All Categories" Pill Button with Dropdown (Vyrqonix Purple Pill) */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer"
              >
                <Menu className="w-4 h-4 text-white" />
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3 ml-0.5 text-purple-200" />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      to={cat.path}
                      onClick={() => setCategoriesOpen(false)}
                      className="block px-4 py-2.5 text-[#172033] hover:bg-purple-50 hover:text-[#7C3AED] font-semibold transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Horizontal Links (Header Config) */}
            <nav className="flex items-center space-x-1.5 xl:space-x-2 text-xs sm:text-sm">
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                
                if (item.label.toLowerCase() === 'services') {
                  return (
                    <div key={idx} className="relative" ref={servicesRef}>
                      <button
                        onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                        className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-full transition-all text-xs font-bold cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 text-[#2563EB] shadow-2xs'
                            : 'text-[#172033] hover:text-[#2563EB] hover:bg-slate-50'
                        }`}
                      >
                        <span>Services</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {servicesDropdownOpen && (
                        <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-xs space-y-1">
                          <Link
                            to="/services"
                            onClick={() => setServicesDropdownOpen(false)}
                            className="block p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-[#2563EB] font-bold transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span>All Agency Services (14)</span>
                              <span className="text-[10px] uppercase tracking-wider font-extrabold">View All →</span>
                            </div>
                          </Link>
                          <div className="border-t border-slate-100 my-1"></div>
                          {agencyServiceCategories.map((c, cIdx) => (
                            <Link
                              key={cIdx}
                              to={c.path}
                              onClick={() => setServicesDropdownOpen(false)}
                              className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <span className="font-bold text-[#08152F] block">{c.title}</span>
                              <span className="text-[11px] text-[#667085] leading-tight block mt-0.5">{c.desc}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={idx}
                    to={item.path}
                    className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-bold ${
                      isActive
                        ? 'bg-blue-50 text-[#2563EB] shadow-2xs'
                        : 'text-[#172033] hover:text-[#2563EB] hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Wishlist Heart Button + User Profile Avatar + Purple Cart Capsule (Matching Vyrqonix) */}
          <div className="flex items-center space-x-3">
            {/* Wishlist Heart Icon Button */}
            <button
              onClick={() => navigate('/products')}
              className="w-10 h-10 rounded-full border border-slate-200 hover:border-[#2563EB] text-[#667085] hover:text-[#2563EB] flex items-center justify-center transition-colors shadow-2xs hover:bg-slate-50 cursor-pointer"
              title="Favorites / Wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* Profile Avatar / Dropdown */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-full border border-slate-200 hover:border-[#2563EB] transition-colors focus:outline-none cursor-pointer"
                  title="My Account"
                >
                  <UserAvatar user={currentUser} size="sm" showBorder />
                  <ChevronDown className="w-3.5 h-3.5 text-[#667085] mr-1" />
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center space-x-3">
                      <UserAvatar user={currentUser} size="md" showBorder />
                      <div className="overflow-hidden">
                        <p className="font-bold text-[#172033] truncate leading-tight">
                          {currentUser.displayName || 'Signed In'}
                        </p>
                        <p className="text-[11px] text-[#667085] truncate mt-0.5">{currentUser.email}</p>
                      </div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-[#2563EB] hover:bg-blue-50 font-bold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-[#172033] hover:bg-slate-50 font-medium transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#667085]" />
                      <span>My Account & Orders</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/account"
                className="w-10 h-10 rounded-full border border-slate-200 hover:border-[#2563EB] flex items-center justify-center text-[#667085] hover:text-[#2563EB] transition-colors shadow-2xs hover:bg-slate-50"
                title="Account"
              >
                <UserIcon className="w-4 h-4" />
              </Link>
            )}

            {/* Cart Capsule Pill Button (Vyrqonix Purple Style with Count & Total Price) */}
            <Link
              to="/cart"
              className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-[#7C3AED]/25 transition-all group"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="absolute -top-2 -right-2.5 min-w-[17px] h-[17px] px-1 bg-white text-[#7C3AED] text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {cart.length}
                </span>
              </div>
              <span className="text-white text-xs font-bold pl-1 border-l border-white/20">{cartTotal} ৳</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-10 bg-white border-b border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto px-5 pt-4 pb-8 space-y-4 animate-in slide-in-from-top duration-200">
            {/* Top Close Row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#2563EB]">Navigation Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct WhatsApp Callout Pill inside Mobile Menu */}
            {headerConfig?.showChatSupport !== false && (
              <a
                href={`https://wa.me/88${(headerConfig?.chatSupportNumber || settings.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{headerConfig?.chatSupportText || 'Chat on WhatsApp'}</span>
                    <span className="text-[11px] font-mono text-emerald-600 block">
                      {headerConfig?.chatSupportNumber || settings.whatsappNumber || '01836126791'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-1 rounded-full">
                  Connect →
                </span>
              </a>
            )}

            {/* Nav links */}
            <div className="space-y-1">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-[#172033] hover:text-[#2563EB] font-bold text-sm transition-colors min-h-[44px]"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>

            {/* Agency Categories */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3">
                Agency Disciplines
              </span>
              {agencyServiceCategories.map((c, cIdx) => (
                <Link
                  key={cIdx}
                  to={c.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors"
                >
                  <span className="font-bold text-xs text-[#08152F] block">{c.title}</span>
                  <span className="text-[10px] text-[#667085] block mt-0.5">{c.desc}</span>
                </Link>
              ))}
            </div>

            {/* Quick Links to Admin and Account */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-bold text-xs transition-colors"
              >
                My Account
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#08152F] hover:bg-[#0D2044] text-[#FFC629] text-center font-bold text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
