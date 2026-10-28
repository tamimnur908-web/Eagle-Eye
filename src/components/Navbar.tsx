import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import {
  Search,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
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
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { settings, headerConfig, socialLinks } = useSettings();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

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
    { name: 'All Products', path: '/products' },
    { name: 'UI & Figma Kits', path: '/products?category=UI Kits' },
    { name: 'Social Media Templates', path: '/products?category=Templates' },
    { name: 'Agency Retainers', path: '/services' },
    { name: 'Web & E-Commerce', path: '/services' },
    { name: 'Branding Kits', path: '/products?category=Branding' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm w-full">
      {/* Dynamic Top Announcement Bar (Header Config) */}
      {headerConfig?.showAnnouncement && headerConfig?.announcementText && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white text-[11px] sm:text-xs py-2 px-4 text-center font-bold tracking-wide relative z-50 flex items-center justify-center space-x-2 shadow-sm">
          <span>{headerConfig.announcementText}</span>
          {headerConfig.announcementLink && (
            <Link
              to={headerConfig.announcementLink}
              className="underline hover:text-amber-300 ml-1.5 transition-colors font-extrabold"
            >
              Explore Now →
            </Link>
          )}
        </div>
      )}

      {/* Top Main Bar (Vyrqonix Style) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <img
              src={settings.logoUrl || '/logo.jpg'}
              alt={settings.brandName || 'Eagle Eye Digital'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.jpg';
              }}
              className="h-10 sm:h-12 w-auto max-w-[140px] object-contain rounded-lg border border-slate-200 p-0.5 group-hover:border-amber-500 transition-colors shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors leading-none">
                {settings.brandName || 'EAGLE EYE'}
              </span>
              <span className="text-[10px] tracking-widest text-amber-600 font-extrabold uppercase mt-0.5">
                {settings.tagline || 'YOUR DIGITAL WORLD'}
              </span>
            </div>
          </Link>

          {/* Central Rounded Search Bar with Action Pill (Like Vyrqonix) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-4 relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for digital products, templates, services..."
              className="w-full h-11 pl-5 pr-14 rounded-full border border-slate-300 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shadow-sm"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Support Pill, Social Icons & User Actions */}
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
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-indigo-600 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-colors"
                    title={item.platform}
                  >
                    <SocialIcon link={item} size={15} />
                  </a>
                ))}
              </div>
            )}

            {/* Dynamic WhatsApp Chat Support Pill (Vyrqonix style) */}
            {headerConfig?.showChatSupport !== false && (
              <a
                href={`https://wa.me/88${(headerConfig?.chatSupportNumber || settings.whatsappNumber || '01836126791').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-500 font-semibold leading-tight">
                    {headerConfig?.chatSupportText || 'Chat Support'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 leading-tight">
                    {headerConfig?.chatSupportNumber || settings.whatsappNumber || '01836126791'}
                  </span>
                </div>
              </a>
            )}

            {/* Wishlist Heart Icon */}
            <button
              onClick={() => navigate('/products')}
              className="p-2 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors hidden sm:block"
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Cart Capsule Button (Vyrqonix Purple Pill Style: 0 ৳0) */}
            <Link
              to="/cart"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{cart.length}</span>
              <span className="border-l border-white/30 pl-1.5">৳0</span>
            </Link>

            {/* Profile Avatar / Dropdown */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center space-x-1 p-1 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none"
                  title="My Account"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email ? currentUser.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400">Signed in as</p>
                      <p className="font-bold text-slate-800 truncate">{currentUser.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-indigo-700 hover:bg-indigo-50 font-bold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Account & Orders</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 font-semibold transition-colors"
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
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-indigo-600 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors shadow-sm"
                title="Account"
              >
                <UserIcon className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 lg:hidden hover:bg-slate-100"
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
            className="w-full h-10 pl-4 pr-12 rounded-full border border-slate-300 text-xs text-slate-800 bg-slate-50"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Sub Header Navigation Bar (Vyrqonix Style: All Categories Pill + Navigation Links) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 border-t border-slate-100 bg-white">
        <div className="flex items-center space-x-6 h-12">
          
          {/* "All Categories" Pill Button with Dropdown (Purple Pill like Vyrqonix) */}
          <div className="relative" ref={catRef}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Categories</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {categoriesOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={cat.path}
                    onClick={() => setCategoriesOpen(false)}
                    className="block px-4 py-2.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Horizontal Links (Header Config) */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs sm:text-sm font-semibold">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-5 pt-3 pb-6 space-y-2.5 shadow-lg">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-indigo-600 font-semibold py-1.5 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
