import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
  X
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

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
      {/* Top Main Bar (Vyrqonix Style) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <img
              src="/logo.jpg"
              alt="Eagle Eye Digital"
              className="h-10 sm:h-12 w-auto object-contain rounded-lg border border-slate-200 p-0.5 group-hover:border-amber-500 transition-colors shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors leading-none">
                EAGLE EYE
              </span>
              <span className="text-[10px] tracking-widest text-amber-600 font-extrabold uppercase mt-0.5">
                YOUR DIGITAL WORLD
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

          {/* Right Support Pill & User Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
            {/* WhatsApp Chat Support Pill (Vyrqonix style) */}
            <a
              href={`https://wa.me/88${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 font-semibold leading-tight">Chat Support</span>
                <span className="text-xs font-bold text-emerald-700 leading-tight">{WHATSAPP_NUMBER}</span>
              </div>
            </a>

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

          {/* Clean Horizontal Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs sm:text-sm font-semibold">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-full bg-indigo-50 transition-colors"
            >
              Home
            </Link>
            <Link to="/products" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Shop
            </Link>
            <Link to="/services" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Services
            </Link>
            <Link to="/portfolio" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Portfolio
            </Link>
            <Link to="/case-studies" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Case Studies
            </Link>
            <Link to="/about" className="text-slate-600 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Our Contacts
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-5 pt-3 pb-6 space-y-2.5 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-indigo-600 font-bold py-1.5 text-sm"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-semibold py-1.5 text-sm"
          >
            Shop (Digital Products)
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-semibold py-1.5 text-sm"
          >
            Services
          </Link>
          <Link
            to="/portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-semibold py-1.5 text-sm"
          >
            Portfolio
          </Link>
          <Link
            to="/case-studies"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-semibold py-1.5 text-sm"
          >
            Case Studies
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-semibold py-1.5 text-sm"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-semibold py-1.5 text-sm"
          >
            Our Contacts
          </Link>
        </div>
      )}
    </header>
  );
};
