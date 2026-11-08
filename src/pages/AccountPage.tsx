import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { LocalizedLink } from '../i18n/LocalizedLink';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getUserOrders, getUserEntitlements, getUserLeads, respondToMeeting } from '../services/firestoreService';
import { Order, DownloadEntitlement, Lead } from '../types';
import {
  Package,
  Download,
  KeyRound,
  AlertCircle,
  CheckCircle,
  Calendar,
  Video,
  Clock,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Heart,
  ShoppingCart,
  Trash2,
  Eye,
  Camera,
  RefreshCw
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { UserAvatar } from '../components/UserAvatar';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const AccountPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser, logout, syncGoogleProfile, updateUserAvatar } = useAuth();
  const [syncingAvatar, setSyncingAvatar] = useState(false);
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const modeParam = searchParams.get('mode');
  const tabParam = searchParams.get('tab');

  // Auth Form State: 'login' | 'register' - Default to 'login'
  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    modeParam === 'register' ? 'register' : 'login'
  );
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (modeParam === 'register') {
      setAuthMode('register');
    } else if (modeParam === 'login') {
      setAuthMode('login');
    }
  }, [modeParam]);

  // If already logged in or login completes, redirect to requested page
  useEffect(() => {
    if (currentUser && redirectParam) {
      navigate(redirectParam, { replace: true });
    }
  }, [currentUser, redirectParam, navigate]);

  // User Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [entitlements, setEntitlements] = useState<DownloadEntitlement[]>([]);
  const [userLeads, setUserLeads] = useState<Lead[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'downloads' | 'inquiries' | 'wishlist'>('inquiries');

  useEffect(() => {
    if (tabParam === 'wishlist') {
      setActiveTab('wishlist');
    } else if (tabParam === 'orders') {
      setActiveTab('orders');
    } else if (tabParam === 'downloads') {
      setActiveTab('downloads');
    } else if (tabParam === 'inquiries') {
      setActiveTab('inquiries');
    }
  }, [tabParam]);

  const loadUserData = async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      const [userOrders, userEntitlements, leads] = await Promise.all([
        getUserOrders(currentUser.uid).catch(() => []),
        getUserEntitlements(currentUser.uid).catch(() => []),
        getUserLeads(currentUser.uid, currentUser.email || undefined).catch(() => [])
      ]);
      setOrders(userOrders);
      setEntitlements(userEntitlements);
      setUserLeads(leads);

      // If user has orders but no inquiries and no tab param, default to orders tab
      if (!tabParam && leads.length === 0 && userOrders.length > 0) {
        setActiveTab('orders');
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  // Map Firebase error codes to localized messages
  const mapAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-email') return t('account.errors.invalidEmail');
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'
    ) {
      return t('account.errors.wrongPassword');
    }
    if (code === 'auth/email-already-in-use') {
      return t('account.errors.emailInUse');
    }
    if (code === 'auth/weak-password') {
      return t('account.errors.weakPassword');
    }
    if (code === 'auth/popup-closed-by-user') {
      return t('account.errors.popupClosed');
    }
    return err?.message || t('account.errors.default');
  };

  // Handle meeting response from user dashboard
  const handleConfirmMeeting = async (leadId: string) => {
    setActionProcessing(leadId);
    try {
      await respondToMeeting(leadId, 'accept');
      await loadUserData();
    } catch (err: any) {
      alert(t('account.inquiry.meetingConfirmError') + ' ' + (err.message || 'Error'));
    } finally {
      setActionProcessing(null);
    }
  };

  const handleCancelMeeting = async (leadId: string) => {
    const reason = window.prompt(t('account.inquiry.meetingCancelPrompt'));
    setActionProcessing(leadId);
    try {
      await respondToMeeting(leadId, 'cancel', reason || undefined);
      await loadUserData();
    } catch (err: any) {
      alert(t('account.inquiry.meetingCancelError') + ' ' + (err.message || 'Error'));
    } finally {
      setActionProcessing(null);
    }
  };

  // Email / Password submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setResetSent(false);

    try {
      if (authMode === 'register') {
        if (!fullName.trim()) {
          throw new Error(t('account.errors.nameRequired'));
        }
        if (!phone.trim()) {
          throw new Error(t('account.errors.phoneRequired'));
        }
        if (password.length < 6) {
          throw new Error(t('account.errors.passwordLength'));
        }
        if (password !== confirmPassword) {
          throw new Error(t('account.errors.passwordMismatch'));
        }

        // 1. Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        // 2. Update Display Name
        await updateProfile(userCredential.user, {
          displayName: fullName.trim()
        });
        // 3. Save User Profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          createdAt: Date.now()
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      setAuthError(mapAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const photo = result.user.photoURL || null;
      const userEmail = (result.user.email || '').toLowerCase().trim();

      if (photo) {
        if (userEmail) {
          localStorage.setItem(`eed_avatar_${userEmail}`, photo);
        }
        localStorage.setItem('eed_user_avatar', photo);
        try {
          await updateProfile(result.user, { photoURL: photo });
        } catch {}
      }

      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        fullName: result.user.displayName || 'Google User',
        email: result.user.email,
        photoURL: photo,
        avatarUrl: photo,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err: any) {
      setAuthError(mapAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setAuthError(t('account.errors.resetEmailRequired'));
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(mapAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-20">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] mx-auto shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-[#08152F]">
              {authMode === 'register' ? t('account.createAccount') : t('account.loginTitle')}
            </h2>
            <p className="text-xs text-[#667085]">
              {authMode === 'register'
                ? t('account.createDesc')
                : t('account.loginDesc')}
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Register Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F8FAFC] rounded-xl text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#08152F] text-white shadow-sm'
                  : 'text-[#667085] hover:text-[#08152F]'
              }`}
            >
              {t('account.loginTab')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#08152F] text-white shadow-sm'
                  : 'text-[#667085] hover:text-[#08152F]'
              }`}
            >
              {t('account.registerTab')}
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{t('account.passwordResetSent')}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#172033] font-bold text-xs flex items-center justify-center space-x-2.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('account.googleSignIn')}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              {t('account.orWithEmail')}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Full Name field (for Register mode) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#08152F] mb-1">
                  {t('account.fullNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('account.fullNamePlaceholder')}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#08152F] mb-1">
                {t('account.emailLabel')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('account.emailPlaceholder')}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            {/* Phone (for Register mode) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#08152F] mb-1">
                  {t('account.phoneLabel')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#08152F] mb-1">
                {t('account.passwordLabel')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authMode === 'register' ? t('account.passwordPlaceholderRegister') : t('account.passwordPlaceholderLogin')}
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
              />
            </div>

            {/* Confirm Password (for Register mode) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#08152F] mb-1">
                  {t('account.confirmPasswordLabel')}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('account.confirmPasswordPlaceholder')}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-lg px-3 py-2 text-sm text-[#08152F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[#667085] hover:text-[#2563EB] underline font-medium transition-colors cursor-pointer"
                >
                  {t('account.forgotPassword')}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors disabled:opacity-50 shadow-md shadow-[#2563EB]/25 cursor-pointer"
            >
              {authLoading ? t('cart.processingOrder') : authMode === 'register' ? t('account.registerBtn') : t('account.loginBtn')}
            </button>
          </form>

          {/* Bottom Switch Note */}
          <div className="pt-2 text-center text-xs text-[#667085]">
            {authMode === 'register' ? (
              <p>
                {t('account.alreadyHaveAccount')}{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  {t('account.loginHere')}
                </button>
              </p>
            ) : (
              <p>
                {t('account.noAccount')}{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  {t('account.registerHere')}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* User Header */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="relative group">
            <UserAvatar user={currentUser} size="lg" showBorder />
            <label
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#08152F] text-white hover:bg-[#2563EB] transition-colors cursor-pointer shadow-md"
              title="Profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert(t('account.dashboard.photoSizeError'));
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = async () => {
                    if (typeof reader.result === 'string') {
                      try {
                        await updateUserAvatar(reader.result);
                      } catch (err: any) {
                        alert(t('account.dashboard.photoSaveError') + ' ' + (err?.message || 'Error'));
                      }
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#08152F]">
              {currentUser.displayName || t('account.dashboard.greeting')}
            </h2>
            <p className="text-xs text-[#667085]">{t('account.dashboard.loggedInAs')} {currentUser.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setSyncingAvatar(true);
                    await syncGoogleProfile();
                  } catch (err: any) {
                    if (err?.code !== 'auth/popup-closed-by-user') {
                      alert('Google profile sync error: ' + (err?.message || 'Error'));
                    }
                  } finally {
                    setSyncingAvatar(false);
                  }
                }}
                disabled={syncingAvatar}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-[11px] font-bold border border-blue-200 transition-colors cursor-pointer"
                title="Sync Google profile photo"
              >
                <RefreshCw className={`w-3 h-3 ${syncingAvatar ? 'animate-spin' : ''}`} />
                <span>{syncingAvatar ? t('cart.processingOrder') : t('account.dashboard.syncGooglePhoto')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Language Switcher & Logout */}
        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher variant="settings" />
          <button
            onClick={logout}
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-red-50 hover:text-red-600 text-[#08152F] text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            {t('account.dashboard.logoutBtn')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
              : 'text-[#667085] hover:text-[#08152F]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t('account.tabs.inquiries')} ({userLeads.length})</span>
          {userLeads.filter((l) => l.meetingDetails?.meetingStatus === 'proposed').length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FFC629]/20 text-[#08152F] border border-[#FFC629]/40 text-[10px] font-black animate-pulse">
              {userLeads.filter((l) => l.meetingDetails?.meetingStatus === 'proposed').length} {t('account.tabs.actionRequired')}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
              : 'text-[#667085] hover:text-[#08152F]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('account.tabs.orders')} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer ${
            activeTab === 'downloads'
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
              : 'text-[#667085] hover:text-[#08152F]'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>{t('account.tabs.downloads')} ({entitlements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer ${
            activeTab === 'wishlist'
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
              : 'text-[#667085] hover:text-[#08152F]'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>{t('account.tabs.wishlist')} ({wishlist.length})</span>
        </button>
      </div>

      {/* Content */}
      {loadingData ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : activeTab === 'inquiries' ? (
        userLeads.length > 0 ? (
          <div className="space-y-6">
            {userLeads.map((lead) => {
              const meeting = lead.meetingDetails;
              const isProposed = meeting && meeting.meetingStatus === 'proposed';
              const isConfirmed = meeting && meeting.meetingStatus === 'confirmed';
              const isCancelled = meeting && meeting.meetingStatus === 'cancelled';

              const formattedMeetingTime = meeting?.scheduledTime
                ? new Date(meeting.scheduledTime).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                : null;

              return (
                <div
                  key={lead.id}
                  className={`bg-white border rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm transition-all ${
                    isProposed
                      ? 'border-[#FFC629] ring-2 ring-[#FFC629]/20'
                      : isConfirmed
                      ? 'border-emerald-300 ring-1 ring-emerald-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('account.inquiry.inquiryNum')} #{lead.id.substring(0, 8)} • {t('account.inquiry.submitted')} {new Date(lead.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                      </span>
                      <h3 className="text-base font-bold text-[#08152F] mt-0.5">
                        {lead.serviceInterest}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isProposed
                            ? 'bg-[#FFC629]/20 text-[#08152F] border border-[#FFC629]/40 animate-pulse'
                            : isCancelled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-50 text-[#2563EB]'
                        }`}
                      >
                        {isConfirmed
                          ? t('account.inquiry.meetingConfirmed')
                          : isProposed
                          ? t('account.inquiry.meetingScheduled')
                          : isCancelled
                          ? t('account.inquiry.meetingCancelled')
                          : lead.status}
                      </span>
                    </div>
                  </div>

                  {/* Consultation / Meeting Workflow Area */}
                  {meeting && (
                    <div
                      className={`rounded-xl p-4 sm:p-5 space-y-3 ${
                        isConfirmed
                          ? 'bg-emerald-50/70 border border-emerald-200'
                          : isProposed
                          ? 'bg-blue-50/70 border border-blue-200'
                          : 'bg-[#F8FAFC] border border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#667085] block">
                            {t('account.inquiry.videoConsultation')}
                          </span>
                          <div className="text-sm sm:text-base font-black text-[#08152F] flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#2563EB]" />
                            <span>{formattedMeetingTime}</span>
                          </div>
                          <span className="text-xs text-[#667085] block">
                            {t('account.inquiry.host')} {meeting.scheduledBy || t('account.inquiry.hostFallback')}
                          </span>
                        </div>

                        {/* Unlocked Meeting Button when Confirmed */}
                        {isConfirmed && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#2563EB]/20 flex items-center space-x-1.5 transition-transform hover:-translate-y-0.5"
                            >
                              <Video className="w-4 h-4" />
                              <span>{t('account.inquiry.joinMeeting')}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleCancelMeeting(lead.id)}
                              disabled={actionProcessing === lead.id}
                              className="px-3 py-2 bg-white hover:bg-red-50 text-[#667085] hover:text-red-600 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                            >
                              {t('account.inquiry.cancelMeeting')}
                            </button>
                          </div>
                        )}

                        {/* Accept / Decline Options when Proposed */}
                        {isProposed && (
                          <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                            <button
                              onClick={() => handleConfirmMeeting(lead.id)}
                              disabled={actionProcessing === lead.id}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{actionProcessing === lead.id ? t('cart.processingOrder') : t('account.inquiry.acceptConfirm')}</span>
                            </button>

                            <button
                              onClick={() => handleCancelMeeting(lead.id)}
                              disabled={actionProcessing === lead.id}
                              className="px-3.5 py-2.5 bg-white hover:bg-red-50 text-[#172033] hover:text-red-700 border border-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{t('account.inquiry.declineMeeting')}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {meeting.notes && (
                        <p className="text-xs text-[#667085] italic bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                          "{meeting.notes}"
                        </p>
                      )}

                      {isProposed && (
                        <p className="text-[11px] text-[#08152F] font-medium bg-[#FFC629]/20 p-2 rounded-lg border border-[#FFC629]/30">
                          ⚠️ {t('account.inquiry.confirmInstruction')}
                        </p>
                      )}

                      {isCancelled && (
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[#667085]">
                            {t('account.inquiry.meetingCancelledLabel')} {meeting.cancellationReason ? `(${meeting.cancellationReason})` : ''}
                          </span>
                          <a
                            href={`https://wa.me/88${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                              `Hi Eagle Eye Digital, I would like to propose a new time for Inquiry #${lead.id.substring(0, 8)}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2563EB] hover:underline font-bold flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{t('account.inquiry.proposeNewTime')}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inquiry Spec Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F8FAFC]/80 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('account.inquiry.budgetRange')}</span>
                      <span className="font-semibold text-[#08152F]">{lead.budgetRange}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('account.inquiry.contactMethod')}</span>
                      <span className="font-semibold text-[#08152F]">{lead.preferredContactMethod} ({lead.phoneOrWhatsApp})</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('account.inquiry.targetDeadline')}</span>
                      <span className="font-semibold text-[#08152F]">{lead.deadline || t('account.inquiry.flexible')}</span>
                    </div>
                  </div>

                  {lead.projectDescription && (
                    <div className="text-xs text-[#667085]">
                      <span className="font-bold text-[#08152F] block mb-0.5">{t('account.inquiry.projectDescription')}</span>
                      <p className="line-clamp-2 text-[#667085]">{lead.projectDescription}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title={t('account.empty.noInquiries')}
            description={t('account.empty.noInquiriesDesc')}
            actionText={t('account.empty.requestConsultation')}
            actionLink="/contact"
          />
        )
      ) : activeTab === 'orders' ? (
        orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-[#08152F]">{t('cart.orderId')} #{order.id}</span>
                    <span className="text-xs text-slate-400 block">
                      {t('account.orders.orderDate')} {new Date(order.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        order.paymentStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.paymentStatus === 'pending'
                          ? 'bg-[#FFC629]/20 text-[#08152F] border border-[#FFC629]/40'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {t('account.orders.paymentStatus')} {order.paymentStatus === 'verified' ? t('account.orders.verified') : order.paymentStatus === 'pending' ? t('account.orders.pending') : t('account.orders.failed')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-[#08152F] font-medium">{item.productName}</span>
                      <span className="text-[#08152F] font-semibold">৳{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[#667085] font-medium">{t('account.orders.totalAmount')} ৳{order.totalAmount} BDT</span>
                  {order.paymentStatus === 'verified' ? (
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t('account.orders.downloadUnlocked')}</span>
                    </span>
                  ) : (
                    <span className="text-[#08152F] text-[11px] font-medium bg-[#FFC629]/20 px-2 py-0.5 rounded border border-[#FFC629]/30">
                      {t('account.orders.awaitingPayment')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title={t('account.empty.noOrders')}
            description={t('account.empty.noOrdersDesc')}
            actionText={t('account.empty.browseProducts')}
            actionLink="/products"
          />
        )
      ) : activeTab === 'downloads' ? (
        entitlements.length > 0 ? (
          <div className="space-y-4">
            {entitlements.map((ent) => (
              <div
                key={ent.id}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#08152F]">{ent.productName}</h4>
                  <span className="text-[10px] text-slate-400">{t('account.downloads.approvedDate')} {new Date(ent.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
                </div>
                <a
                  href={ent.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('account.downloads.downloadBtn')}</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Download}
            title={t('account.empty.noDownloads')}
            description={t('account.empty.noDownloadsDesc')}
          />
        )
      ) : (
        /* Wishlist Tab */
        wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-slate-400">
                      <Heart className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-[#08152F] text-base leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="pt-2 flex items-baseline space-x-2">
                      <span className="text-lg font-black text-[#08152F]">
                        ৳{item.salePrice ?? item.price}
                      </span>
                      {item.salePrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ৳{item.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <LocalizedLink
                      to={`/products/${item.slug || item.id}`}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-[#2563EB] text-[#172033] hover:text-[#2563EB] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('account.wishlist.viewProduct')}</span>
                    </LocalizedLink>

                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{t('account.wishlist.addToCart')}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="w-full py-1.5 text-center text-red-500 hover:text-red-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('account.wishlist.removeFromWishlist')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title={t('account.empty.noWishlist')}
            description={t('account.empty.noWishlistDesc')}
            actionText={t('account.empty.browseStore')}
            actionLink="/products"
          />
        )
      )}
    </div>
  );
};
