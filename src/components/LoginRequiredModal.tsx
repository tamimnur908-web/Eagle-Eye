import React, { useEffect, useState } from 'react';
import { useAuthModal, DEFAULT_BENGALI_TITLE, DEFAULT_BENGALI_MESSAGE } from '../context/AuthModalContext';
import { useAuth } from '../context/AuthContext';
import { Lock, X, LogIn, Sparkles, Loader2 } from 'lucide-react';

export const LoginRequiredModal: React.FC = () => {
  const { isLoginModalOpen, modalConfig, handleLoginRedirect, handleCancel, closeLoginModal } = useAuthModal();
  const { syncGoogleProfile } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08152F]/75 backdrop-blur-xs animate-in fade-in duration-200"
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
          aria-label="বাতিল করুন"
          className="absolute top-4 right-4 p-1.5 text-[#667085] hover:text-[#08152F] hover:bg-[#F8FAFC] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#08152F] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-[#2563EB]/25">
            <Lock className="w-5 h-5" />
          </div>
          {/* Cyan Glow Accent */}
          <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#FFC629] text-[#08152F] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#08152F]" />
          </span>
        </div>

        {/* Text Content in Bengali */}
        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-[#2563EB] block">
            Eagle Eye Digital • সুরক্ষিত অ্যাকশন
          </span>
          <h3 id="login-modal-title" className="text-xl sm:text-2xl font-black text-[#08152F]">
            {modalConfig.title || DEFAULT_BENGALI_TITLE}
          </h3>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-sm mx-auto font-medium">
            {modalConfig.message || DEFAULT_BENGALI_MESSAGE}
          </p>
        </div>

        {/* Action Buttons in Bengali */}
        <div className="pt-2 space-y-2.5">
          {/* Direct 1-Click Google Sign In */}
          <button
            type="button"
            onClick={async () => {
              try {
                setGoogleLoading(true);
                await syncGoogleProfile();
                closeLoginModal();
              } catch (err: any) {
                if (err?.code !== 'auth/popup-closed-by-user') {
                  handleLoginRedirect();
                }
              } finally {
                setGoogleLoading(false);
              }
            }}
            disabled={googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#08152F] font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2.5 active:scale-[0.99] cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{googleLoading ? 'সাইন-ইন হচ্ছে...' : 'গুগল দিয়ে সরাসরি সাইন-ইন'}</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>ইমেইল দিয়ে লগইন</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-slate-200 text-[#08152F] font-bold text-xs border border-slate-200 transition-all flex items-center justify-center active:scale-[0.99] cursor-pointer"
            >
              বাতিল
            </button>
          </div>
        </div>

        {/* Trust & Security Footer Tag in Bengali */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-[#667085]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>গেস্ট ব্রাউজিং সম্পূর্ণ ফ্রি • লগইন করলে তাৎক্ষণিক অ্যাক্সেস সুবিধা পাবেন</span>
        </div>
      </div>
    </div>
  );
};
