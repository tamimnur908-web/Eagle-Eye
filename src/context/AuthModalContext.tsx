import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export interface LoginModalConfig {
  title?: string;
  message?: string;
  redirectPath?: string;
}

interface AuthModalContextType {
  isLoginModalOpen: boolean;
  modalConfig: LoginModalConfig;
  openLoginModal: (config?: LoginModalConfig) => void;
  closeLoginModal: () => void;
  handleLoginRedirect: () => void;
  handleCancel: () => void;
  requireAuth: (callback: () => void, config?: LoginModalConfig) => boolean;
}

const DEFAULT_TITLE = 'Login Required';
const DEFAULT_MESSAGE = 'Please log in to your account to add products to your cart and continue shopping.';

const AuthModalContext = createContext<AuthModalContextType>({
  isLoginModalOpen: false,
  modalConfig: {
    title: DEFAULT_TITLE,
    message: DEFAULT_MESSAGE,
  },
  openLoginModal: () => {},
  closeLoginModal: () => {},
  handleLoginRedirect: () => {},
  handleCancel: () => {},
  requireAuth: () => false,
});

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<LoginModalConfig>({
    title: DEFAULT_TITLE,
    message: DEFAULT_MESSAGE,
  });

  const openLoginModal = useCallback((config?: LoginModalConfig) => {
    setModalConfig({
      title: config?.title || DEFAULT_TITLE,
      message: config?.message || DEFAULT_MESSAGE,
      redirectPath: config?.redirectPath || `${location.pathname}${location.search}`,
    });
    setIsLoginModalOpen(true);
  }, [location.pathname, location.search]);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    const target = modalConfig.redirectPath || `${location.pathname}${location.search}`;
    closeLoginModal();
    navigate(`/account?mode=login&redirect=${encodeURIComponent(target)}`);
  }, [closeLoginModal, modalConfig.redirectPath, navigate, location.pathname, location.search]);

  const handleCancel = useCallback(() => {
    closeLoginModal();
    // If user attempted to navigate to /cart directly while unauthenticated, return them to previous page
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
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
