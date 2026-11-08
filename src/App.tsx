import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider, useLanguage, LocalizedLink } from './i18n';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingSocialBar } from './components/FloatingSocialBar';
import { LoginRequiredModal } from './components/LoginRequiredModal';
import { SEOHead } from './components/SEOHead';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { CaseStudiesPage } from './pages/CaseStudiesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LegalPage } from './pages/LegalPage';
import { ScheduleMeetingPage } from './pages/ScheduleMeetingPage';
import { MeetingResponsePage } from './pages/MeetingResponsePage';

import { ErrorBoundary } from './components/ErrorBoundary';

// ── Language-aware redirect: bare paths → /en/... ──────────────────────────
function LanguageRedirect() {
  const location = useLocation();
  // Get saved language preference or default to 'en'
  let savedLang = 'en';
  try {
    const stored = localStorage.getItem('eed_language');
    if (stored === 'en' || stored === 'bn') savedLang = stored;
  } catch {}
  return <Navigate to={`/${savedLang}${location.pathname}${location.search}${location.hash}`} replace />;
}

// ── Localized routes wrapper ───────────────────────────────────────────────
function LocalizedRoutes() {
  const { t } = useLanguage();

  return (
    <Routes>
      {/* Customer-Facing Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:slug" element={<ServiceDetailPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/case-studies" element={<CaseStudiesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/schedule-meeting" element={<ScheduleMeetingPage />} />
      <Route path="/meeting-response" element={<MeetingResponsePage />} />

      {/* Legal & Informational Pages */}
      <Route path="/privacy-policy" element={<LegalPage type="privacy" />} />
      <Route path="/terms" element={<LegalPage type="terms" />} />
      <Route path="/refund-policy" element={<LegalPage type="refund" />} />
      <Route path="/license-policy" element={<LegalPage type="license" />} />
      <Route path="/faq" element={<LegalPage type="faq" />} />
      <Route path="/support" element={<LegalPage type="support" />} />

      {/* 404 Not Found fallback */}
      <Route
        path="*"
        element={
          <div className="py-24 text-center space-y-4">
            <h1 className="text-5xl font-black text-[#2563EB]">{t('notFound.title')}</h1>
            <h2 className="text-xl font-bold text-[#08152F]">{t('notFound.heading')}</h2>
            <p className="text-xs text-[#667085]">{t('notFound.description')}</p>
            <LocalizedLink to="/" className="inline-block px-5 py-2.5 bg-[#08152F] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors">
              {t('notFound.returnHome')}
            </LocalizedLink>
          </div>
        }
      />
    </Routes>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={isAdminRoute ? "h-screen w-full overflow-hidden bg-[#F3F5F9] text-[#172033]" : "min-h-screen flex flex-col bg-[#F3F5F9] text-[#172033] relative"}>
      {/* SEO metadata for language */}
      {!isAdminRoute && <SEOHead />}

      {/* Hide customer storefront Header/Navbar in Admin panel */}
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "h-full w-full overflow-hidden" : "flex-grow"}>
        <Routes>
          {/* Direct language root redirects */}
          <Route path="/en" element={<Navigate to="/en/" replace />} />
          <Route path="/bn" element={<Navigate to="/bn/" replace />} />

          {/* Language-prefixed routes: /en/... and /bn/... */}
          <Route path="/en/*" element={<LocalizedRoutes />} />
          <Route path="/bn/*" element={<LocalizedRoutes />} />

          {/* Admin Dashboard (no language prefix) */}
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Bare legacy routes → redirect to language-prefixed version */}
          <Route path="/" element={<LanguageRedirect />} />
          <Route path="/services" element={<LanguageRedirect />} />
          <Route path="/services/:slug" element={<LanguageRedirect />} />
          <Route path="/products" element={<LanguageRedirect />} />
          <Route path="/products/:slug" element={<LanguageRedirect />} />
          <Route path="/cart" element={<LanguageRedirect />} />
          <Route path="/portfolio" element={<LanguageRedirect />} />
          <Route path="/case-studies" element={<LanguageRedirect />} />
          <Route path="/about" element={<LanguageRedirect />} />
          <Route path="/contact" element={<LanguageRedirect />} />
          <Route path="/account" element={<LanguageRedirect />} />
          <Route path="/schedule-meeting" element={<LanguageRedirect />} />
          <Route path="/meeting-response" element={<LanguageRedirect />} />
          <Route path="/privacy-policy" element={<LanguageRedirect />} />
          <Route path="/terms" element={<LanguageRedirect />} />
          <Route path="/refund-policy" element={<LanguageRedirect />} />
          <Route path="/license-policy" element={<LanguageRedirect />} />
          <Route path="/faq" element={<LanguageRedirect />} />
          <Route path="/support" element={<LanguageRedirect />} />

          {/* 404 fallback for truly unmatched routes */}
          <Route path="*" element={<LanguageRedirect />} />
        </Routes>
      </main>

      {/* Hide customer storefront Footer and Floating bar in Admin panel */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingSocialBar />}

      {/* Global Login-First / Protected Action Modal */}
      <LoginRequiredModal />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <LanguageProvider>
              <AuthModalProvider>
                <CartProvider>
                  <WishlistProvider>
                    <AppLayout />
                  </WishlistProvider>
                </CartProvider>
              </AuthModalProvider>
            </LanguageProvider>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
