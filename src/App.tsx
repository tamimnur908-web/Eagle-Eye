import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

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

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
            <Navbar />
            <main className="flex-grow">
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
                      <h1 className="text-5xl font-black text-amber-600">404</h1>
                      <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
                      <p className="text-xs text-slate-500">The requested resource could not be found.</p>
                      <a href="/" className="inline-block px-4 py-2 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg shadow-sm">
                        Return Home
                      </a>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
