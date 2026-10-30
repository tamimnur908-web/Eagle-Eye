import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DigitalProduct } from '../types';
import { useAuth } from './AuthContext';
import { useAuthModal, getPendingAction, clearPendingAction, savePendingAction } from './AuthModalContext';
import { getUserWishlist, saveUserWishlist } from '../services/firestoreService';

interface WishlistContextType {
  wishlist: DigitalProduct[];
  addToWishlist: (product: DigitalProduct) => boolean;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: DigitalProduct) => boolean;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  addToWishlist: () => false,
  removeFromWishlist: () => {},
  toggleWishlist: () => false,
  isInWishlist: () => false,
  clearWishlist: () => {},
  isLoading: false,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [wishlist, setWishlist] = useState<DigitalProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync wishlist on auth change
  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }

    let isMounted = true;
    const loadWishlist = async () => {
      setIsLoading(true);
      try {
        // Load local cache first for fast response
        const local = localStorage.getItem(`eed_wishlist_${currentUser.uid}`);
        let initialItems: DigitalProduct[] = [];
        if (local) {
          try {
            initialItems = JSON.parse(local);
          } catch {
            initialItems = [];
          }
        }
        if (isMounted && initialItems.length > 0) {
          setWishlist(initialItems);
        }

        // Fetch from Firestore
        const remoteItems = await getUserWishlist(currentUser.uid);
        if (isMounted) {
          if (remoteItems.length > 0) {
            setWishlist(remoteItems);
            localStorage.setItem(`eed_wishlist_${currentUser.uid}`, JSON.stringify(remoteItems));
          } else if (initialItems.length > 0) {
            // Push local cache to Firestore if remote is empty
            await saveUserWishlist(currentUser.uid, initialItems);
          }
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWishlist();

    // Check for pending wishlist action
    const pending = getPendingAction();
    if (pending && pending.type === 'wishlist' && pending.data) {
      const pendingProduct = pending.data as DigitalProduct;
      setWishlist((prev) => {
        if (prev.some((p) => p.id === pendingProduct.id)) return prev;
        const updated = [...prev, pendingProduct];
        localStorage.setItem(`eed_wishlist_${currentUser.uid}`, JSON.stringify(updated));
        saveUserWishlist(currentUser.uid, updated).catch(console.error);
        return updated;
      });
      clearPendingAction();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const addToWishlist = useCallback(
    (product: DigitalProduct): boolean => {
      if (!currentUser) {
        savePendingAction({
          type: 'wishlist',
          data: product,
          redirectPath: `/products/${product.slug || product.id}`,
        });
        openLoginModal({
          actionType: 'wishlist',
          redirectPath: `/products/${product.slug || product.id}`,
        });
        return false;
      }

      setWishlist((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev;
        const updated = [...prev, product];
        localStorage.setItem(`eed_wishlist_${currentUser.uid}`, JSON.stringify(updated));
        saveUserWishlist(currentUser.uid, updated).catch(console.error);
        return updated;
      });
      return true;
    },
    [currentUser, openLoginModal]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      if (!currentUser) return;
      setWishlist((prev) => {
        const updated = prev.filter((p) => p.id !== productId);
        localStorage.setItem(`eed_wishlist_${currentUser.uid}`, JSON.stringify(updated));
        saveUserWishlist(currentUser.uid, updated).catch(console.error);
        return updated;
      });
    },
    [currentUser]
  );

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlist.some((p) => p.id === productId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product: DigitalProduct): boolean => {
      if (!currentUser) {
        return addToWishlist(product);
      }
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        return false;
      } else {
        return addToWishlist(product);
      }
    },
    [currentUser, addToWishlist, isInWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    if (currentUser) {
      localStorage.removeItem(`eed_wishlist_${currentUser.uid}`);
      saveUserWishlist(currentUser.uid, []).catch(console.error);
    }
    setWishlist([]);
  }, [currentUser]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
