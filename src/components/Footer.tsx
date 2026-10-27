import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Shield } from 'lucide-react';
import { WHATSAPP_NUMBER, BUSINESS_EMAIL } from '../lib/firebase';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.jpg"
                alt="Eagle Eye Digital"
                className="h-10 w-auto rounded border border-slate-300 bg-white p-0.5 shadow-sm"
              />
              <span className="text-lg font-bold tracking-wider text-slate-900">
                EAGLE EYE <span className="text-amber-600">DIGITAL</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your marketing partner. Specialized in digital marketing, full-funnel agency execution, performance ads, web development, and high-converting digital assets.
            </p>
            <div className="text-xs text-amber-600 font-bold">
              Focus • Strategy • Growth
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Agency Services</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link to="/services" className="hover:text-amber-600 transition-colors">
                  Digital Marketing & Ads
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-600 transition-colors">
                  Social Media Management
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-600 transition-colors">
                  Web & E-Commerce Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-600 transition-colors">
                  Branding & Visual Design
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-600 transition-colors">
                  Consultation & Strategy
                </Link>
              </li>
            </ul>
          </div>

          {/* Digital Products & Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Resources & Work</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link to="/products" className="hover:text-amber-600 transition-colors">
                  Digital Products Store
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-amber-600 transition-colors">
                  Client Portfolio
                </Link>
              </li>
              <li>
                <Link to="/case-studies" className="hover:text-amber-600 transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-amber-600 transition-colors">
                  Agency FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-amber-600 transition-colors">
                  Client Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Direct Connect</h4>
            <div className="space-y-2 text-sm font-medium">
              <a
                href={`mailto:${BUSINESS_EMAIL}`}
                className="flex items-center space-x-2 text-slate-700 hover:text-amber-600 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-600" />
                <span>{BUSINESS_EMAIL}</span>
              </a>
              <a
                href={`https://wa.me/88${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: {WHATSAPP_NUMBER}</span>
              </a>
              <div className="flex items-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>+880 {WHATSAPP_NUMBER}</span>
              </div>
            </div>

            {/* Timezone & Currency Note */}
            <div className="pt-2 text-xs text-slate-500">
              <p>Operating Timezone: Asia/Dhaka (GMT+6)</p>
              <p>Primary Currency: BDT (৳) & USD ($)</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <div>
            © {new Date().getFullYear()} Eagle Eye Digital. All rights reserved.
          </div>
          <div className="flex space-x-6 font-medium">
            <Link to="/privacy-policy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-slate-900">Refund Policy</Link>
            <Link to="/license-policy" className="hover:text-slate-900">License Policy</Link>
            <Link to="/admin" className="hover:text-amber-600 flex items-center space-x-1 font-semibold text-amber-600">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
