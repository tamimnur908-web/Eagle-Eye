import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { DigitalProduct } from '../types';

export type ProtectedActionType = 'cart' | 'wishlist' | 'inquiry' | 'checkout' | 'review' | 'general';

export interface PendingAction {
  type: ProtectedActionType;
  productId?: string;
  product?: DigitalProduct;
  serviceId?: string;
  serviceName?: string;
  formData?: any;
  data?: any;
  targetUrl?: string;
  redirectPath?: string;
  createdAt?: number;
}

export interface LoginModalConfig {
  title?: string;
  message?: string;
  actionType?: ProtectedActionType;
  redirectPath?: string;
  pendingAction?: Partial<PendingAction> & { type: ProtectedActionType };
}

interface AuthModalContextType {
  isLoginModalOpen: boolean;
  modalConfig: LoginModalConfig;
  openLoginModal: (config?: LoginModalConfig) => void;
  closeLoginModal: () => void;
  handleLoginRedirect: () => void;
  handleCancel: () => void;
  requireAuth: (callback: () => void, config?: LoginModalConfig) => boolean;
  getPendingAction: () => PendingAction | null;
  clearPendingAction: () => void;
  savePendingAction: (action: Partial<PendingAction> & { type: ProtectedActionType }) => void;
}

export const DEFAULT_BENGALI_TITLE = 'লগইন প্রয়োজন';
export const DEFAULT_BENGALI_MESSAGE = 'এই কাজটি সম্পন্ন করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।';

export const ACTION_BENGALI_MESSAGES: Record<ProtectedActionType, string> = {
  cart: 'পণ্যটি কার্টে যোগ করতে লগইন করুন।',
  wishlist: 'পণ্যটি পছন্দের তালিকায় রাখতে লগইন করুন।',
  inquiry: 'পণ্য বা সার্ভিস সম্পর্কে অনুসন্ধান পাঠাতে লগইন করুন।',
  checkout: 'অর্ডার সম্পন্ন করতে লগইন করুন।',
  review: 'রিভিউ দিতে লগইন করুন।',
  general: 'এই কাজটি সম্পন্ন করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।',
};

const PENDING_ACTION_STORAGE_KEY = 'eed_pending_action';

export const getPendingAction = (): PendingAction | null => {
  try {
    const saved = sessionStorage.getItem(PENDING_ACTION_STORAGE_KEY);
    if (!saved) return null;
    const parsed: PendingAction = JSON.parse(saved);
    if (parsed.createdAt && Date.now() - parsed.createdAt > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingAction = () => {
  try {
    sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
  } catch {}
};

export const savePendingAction = (action: Partial<PendingAction> & { type: ProtectedActionType }) => {
  try {
    const fullAction: PendingAction = {
      targetUrl: window.location.pathname + window.location.search,
      createdAt: Date.now(),
      ...action,
    };
    sessionStorage.setItem(PENDING_ACTION_STORAGE_KEY, JSON.stringify(fullAction));
  } catch {}
};

const AuthModalContext = createContext<AuthModalContextType>({
  isLoginModalOpen: false,
  modalConfig: {
    title: DEFAULT_BENGALI_TITLE,
    message: DEFAULT_BENGALI_MESSAGE,
    actionType: 'general',
  },
  openLoginModal: () => {},
  closeLoginModal: () => {},
  handleLoginRedirect: () => {},
  handleCancel: () => {},
  requireAuth: () => false,
  getPendingAction: () => null,
  clearPendingAction: () => {},
  savePendingAction: () => {},
});

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<LoginModalConfig>({
    title: DEFAULT_BENGALI_TITLE,
    message: DEFAULT_BENGALI_MESSAGE,
    actionType: 'general',
  });

  const getPendingAction = useCallback((): PendingAction | null => {
    try {
      const saved = sessionStorage.getItem(PENDING_ACTION_STORAGE_KEY);
      if (!saved) return null;
      const parsed: PendingAction = JSON.parse(saved);
      // Discard actions older than 2 hours to avoid stale states
      if (parsed.createdAt && Date.now() - parsed.createdAt > 2 * 60 * 60 * 1000) {
        sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const clearPendingAction = useCallback(() => {
    try {
      sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
    } catch {}
  }, []);

  const savePendingAction = useCallback((action: Partial<PendingAction> & { type: ProtectedActionType }) => {
    try {
      const fullAction: PendingAction = {
        ...action,
        targetUrl: `${location.pathname}${location.search}`,
        createdAt: Date.now(),
      };
      sessionStorage.setItem(PENDING_ACTION_STORAGE_KEY, JSON.stringify(fullAction));
    } catch {}
  }, [location.pathname, location.search]);

  const openLoginModal = useCallback((config?: LoginModalConfig) => {
    const actionType = config?.actionType || 'general';
    const message = config?.message || ACTION_BENGALI_MESSAGES[actionType] || DEFAULT_BENGALI_MESSAGE;
    const title = config?.title || DEFAULT_BENGALI_TITLE;
    const currentTarget = config?.redirectPath || `${location.pathname}${location.search}`;

    if (config?.pendingAction) {
      savePendingAction(config.pendingAction);
    }

    setModalConfig({
      title,
      message,
      actionType,
      redirectPath: currentTarget,
      pendingAction: config?.pendingAction,
    });
    setIsLoginModalOpen(true);
  }, [location.pathname, location.search, savePendingAction]);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    const target = modalConfig.redirectPath || `${location.pathname}${location.search}`;
    closeLoginModal();
    // Default to login tab with return redirect parameter
    navigate(`/account?mode=login&redirect=${encodeURIComponent(target)}`);
  }, [closeLoginModal, modalConfig.redirectPath, navigate, location.pathname, location.search]);

  const handleCancel = useCallback(() => {
    closeLoginModal();
    // If visitor entered /cart directly while unauthenticated, return them
    if (location.pathname === '/cart') {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/products');
      }
    }
  }, [closeLoginModal, location.pathname, navigate]);

  const requireAuth = useCallback(
    (callback: () => void, config?: LoginModalConfig): boolean => {
      if (!currentUser) {
        openLoginModal(config);
        return false;
      }
      callback();
      return true;
    },
    [currentUser, openLoginModal]
  );

  return (
    <AuthModalContext.Provider
      value={{
        isLoginModalOpen,
        modalConfig,
        openLoginModal,
        closeLoginModal,
        handleLoginRedirect,
        handleCancel,
        requireAuth,
        getPendingAction,
        clearPendingAction,
        savePendingAction,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
