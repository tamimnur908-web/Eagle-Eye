import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingSocialBar } from './components/FloatingSocialBar';
import { LoginRequiredModal } from './components/LoginRequiredModal';

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

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={isAdminRoute ? "h-screen w-full overflow-hidden bg-[#F3F5F9] text-[#172033]" : "min-h-screen flex flex-col bg-[#F3F5F9] text-[#172033] relative"}>
      {/* Hide customer storefront Header/Navbar in Admin panel */}
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "h-full w-full overflow-hidden" : "flex-grow"}>
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

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboardPage />} />

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
                <h1 className="text-5xl font-black text-[#2563EB]">404</h1>
                <h2 className="text-xl font-bold text-[#08152F]">Page Not Found</h2>
                <p className="text-xs text-[#667085]">The requested resource could not be found.</p>
                <a href="/" className="inline-block px-5 py-2.5 bg-[#08152F] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors">
                  Return Home
                </a>
              </div>
            }
          />
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
            <AuthModalProvider>
              <CartProvider>
                <WishlistProvider>
                  <AppLayout />
                </WishlistProvider>
              </CartProvider>
            </AuthModalProvider>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
