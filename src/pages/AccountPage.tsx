import React, { useState, useEffect } from 'react';
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
  User as UserIcon,
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
  Briefcase
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/firebase';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';

export const AccountPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  // Auth Form State: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [searchParams] = useSearchParams();

  // User Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [entitlements, setEntitlements] = useState<DownloadEntitlement[]>([]);
  const [userLeads, setUserLeads] = useState<Lead[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'downloads' | 'inquiries'>('inquiries');

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

      // If user has orders but no inquiries, default to orders tab
      if (leads.length === 0 && userOrders.length > 0) {
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

  // Handle meeting response from user dashboard
  const handleConfirmMeeting = async (leadId: string) => {
    setActionProcessing(leadId);
    try {
      await respondToMeeting(leadId, 'accept');
      await loadUserData();
    } catch (err: any) {
      alert('Failed to confirm meeting: ' + (err.message || 'Unknown error'));
    } finally {
      setActionProcessing(null);
    }
  };

  const handleCancelMeeting = async (leadId: string) => {
    const reason = window.prompt('Please provide a reason or your preferred alternative time:');
    setActionProcessing(leadId);
    try {
      await respondToMeeting(leadId, 'cancel', reason || undefined);
      await loadUserData();
    } catch (err: any) {
      alert('Failed to cancel meeting: ' + (err.message || 'Unknown error'));
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
          throw new Error('Please enter your full name.');
        }
        // 1. Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // 2. Update Display Name
        await updateProfile(userCredential.user, {
          displayName: fullName.trim()
        });
        // 3. Save User Profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          fullName: fullName.trim(),
          email: email.trim(),
          createdAt: Date.now()
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error. Please check your credentials.');
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
      const result = await signInWithPopup(auth, provider);
      // Save/merge user info
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        fullName: result.user.displayName || 'Google User',
        email: result.user.email,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setAuthError('Please enter your email address to reset password.');
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset email.');
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
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {authMode === 'register' ? 'Create New Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500">
              Access your digital products, order history, and quotations.
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Register Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
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
              <span>Password reset email dispatched to {email}.</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2.5 shadow-sm transition-colors disabled:opacity-50"
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
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Full Name field (for Register mode) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tamim Nur"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-amber-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-amber-600">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {authMode === 'login' && (
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-slate-500 hover:text-amber-600 underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors disabled:opacity-50 shadow-md shadow-amber-500/25"
            >
              {authLoading ? 'Processing...' : authMode === 'register' ? 'Complete Registration' : 'Sign In'}
            </button>
          </form>

          {/* Bottom Switch Note */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {authMode === 'register' ? (
              <p>
                Already registered?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-amber-600 font-bold hover:underline"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-amber-600 font-bold hover:underline"
                >
                  Create one now
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
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xl">
            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email ? currentUser.email.charAt(0).toUpperCase() : <UserIcon className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentUser.displayName || 'Customer Portal'}
            </h2>
            <p className="text-xs text-slate-600">Signed in as: {currentUser.email}</p>
            <p className="text-[10px] text-slate-400 font-mono">UID: {currentUser.uid}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'inquiries'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Inquiries & Consultations ({userLeads.length})</span>
          {userLeads.filter((l) => l.meetingDetails?.meetingStatus === 'proposed').length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
              {userLeads.filter((l) => l.meetingDetails?.meetingStatus === 'proposed').length} Action Required
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-b-2 border-amber-500 text-amber-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'downloads'
              ? 'border-b-2 border-amber-500 text-amber-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>My Downloads ({entitlements.length})</span>
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
                ? new Date(meeting.scheduledTime).toLocaleString('en-US', {
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
                      ? 'border-amber-300 ring-2 ring-amber-400/20'
                      : isConfirmed
                      ? 'border-emerald-300 ring-1 ring-emerald-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Inquiry #{lead.id.substring(0, 8)} • Submitted {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {lead.serviceInterest}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isProposed
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : isCancelled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {isConfirmed
                          ? '✓ Meeting Confirmed'
                          : isProposed
                          ? '● Meeting Scheduled (Action Required)'
                          : isCancelled
                          ? '✕ Meeting Cancelled'
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
                          ? 'bg-amber-50/70 border border-amber-200'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            Strategic Video Consultation
                          </span>
                          <div className="text-sm sm:text-base font-black text-slate-900 flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{formattedMeetingTime}</span>
                          </div>
                          <span className="text-xs text-slate-600 block">
                            Host: {meeting.scheduledBy || 'Eagle Eye Digital Strategist'}
                          </span>
                        </div>

                        {/* Unlocked Meeting Button when Confirmed */}
                        {isConfirmed && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-transform hover:-translate-y-0.5"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Meeting</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleCancelMeeting(lead.id)}
                              disabled={actionProcessing === lead.id}
                              className="px-3 py-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 text-xs font-semibold rounded-xl"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Accept / Decline Options when Proposed */}
                        {isProposed && (
                          <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                            <button
                              onClick={() => handleConfirmMeeting(lead.id)}
                              disabled={actionProcessing === lead.id}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{actionProcessing === lead.id ? 'Confirming...' : 'Accept / Confirm Time'}</span>
                            </button>

                            <button
                              onClick={() => handleCancelMeeting(lead.id)}
                              disabled={actionProcessing === lead.id}
                              className="px-3.5 py-2.5 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 font-bold text-xs rounded-xl"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Decline / Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {meeting.notes && (
                        <p className="text-xs text-slate-600 italic bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                          "{meeting.notes}"
                        </p>
                      )}

                      {isProposed && (
                        <p className="text-[11px] text-amber-800 font-medium">
                          ⚠️ Please click <strong>Accept / Confirm Time</strong> to lock in your appointment and unlock the direct Video Meeting link.
                        </p>
                      )}

                      {isCancelled && (
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-slate-500">
                            Meeting was cancelled {meeting.cancellationReason ? `(${meeting.cancellationReason})` : ''}
                          </span>
                          <a
                            href={`https://wa.me/88${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                              `Hello Eagle Eye Digital, I would like to request a new consultation time for inquiry #${lead.id.substring(0, 8)}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline font-bold flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Propose New Time on WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inquiry Spec Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Budget Range</span>
                      <span className="font-semibold text-slate-800">{lead.budgetRange}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Method</span>
                      <span className="font-semibold text-slate-800">{lead.preferredContactMethod} ({lead.phoneOrWhatsApp})</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Timeline</span>
                      <span className="font-semibold text-slate-800">{lead.deadline || 'Flexible'}</span>
                    </div>
                  </div>

                  {lead.projectDescription && (
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-700 block mb-0.5">Project Scope:</span>
                      <p className="line-clamp-2 text-slate-500">{lead.projectDescription}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Inquiries or Meetings Yet"
            description="When you submit an agency inquiry or request a strategic consultation, your appointment and video links will appear here."
            actionText="Request a Consultation"
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
                    <span className="text-xs font-semibold text-slate-800">Order ID: #{order.id}</span>
                    <span className="text-xs text-slate-400 block">
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        order.paymentStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.paymentStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      Status: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-800 font-medium">{item.productName}</span>
                      <span className="text-slate-600 font-semibold">৳{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">Total: ৳{order.totalAmount} BDT</span>
                  {order.paymentStatus === 'verified' ? (
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Unlocked in Downloads</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 text-[11px] font-medium">
                      Awaiting payment confirmation
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No Orders Yet"
            description="You have not placed any orders yet. Visit our digital products store to purchase templates and assets."
          />
        )
      ) : entitlements.length > 0 ? (
        <div className="space-y-4">
          {entitlements.map((ent) => (
            <div
              key={ent.id}
              className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{ent.productName}</h4>
                <span className="text-[10px] text-slate-400">Authorized on {new Date(ent.createdAt).toLocaleDateString()}</span>
              </div>
              <a
                href={ent.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Download}
          title="No Digital Downloads Available"
          description="Paid downloads become available here as soon as orders are verified by admin or payments complete."
        />
      )}
    </div>
  );
};
