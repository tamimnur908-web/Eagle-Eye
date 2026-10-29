import React, { useEffect } from 'react';
import { useAuthModal } from '../context/AuthModalContext';
import { Lock, X, LogIn, Sparkles } from 'lucide-react';

export const LoginRequiredModal: React.FC = () => {
  const { isLoginModalOpen, modalConfig, handleLoginRedirect, handleCancel } = useAuthModal();

  // Close on Escape key press
  useEffect(() => {
    if (!isLoginModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, handleCancel]);

  if (!isLoginModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#101828] to-[#246BFD] text-white flex items-center justify-center shadow-md shadow-[#246BFD]/25">
            <Lock className="w-5 h-5" />
          </div>
          {/* Cyan Glow Accent */}
          <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#36D6E7] text-[#101828] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#101828]" />
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-[#246BFD] block">
            Eagle Eye Digital • Protected Action
          </span>
          <h3 id="login-modal-title" className="text-xl sm:text-2xl font-black text-[#101828]">
            {modalConfig.title || 'Login Required'}
          </h3>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-sm mx-auto">
            {modalConfig.message ||
              'Please log in to your account to add products to your cart and continue shopping.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#246BFD] hover:bg-[#1A56DB] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#246BFD]/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#F8FAFC] hover:bg-slate-200 text-[#101828] font-bold text-xs sm:text-sm border border-slate-200 transition-all flex items-center justify-center active:scale-[0.99] cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Trust & Security Footer Tag */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-[#667085]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Guest browsing is free • Login unlocks instant access & downloads</span>
        </div>
      </div>
    </div>
  );
};
