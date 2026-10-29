import React, { createContext, useContext, useState, useEffect } from 'react';
import { DigitalProduct, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: DigitalProduct) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => false,
  removeFromCart: () => {},
  clearCart: () => {},
  totalPrice: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { openLoginModal } = useAuthModal();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      if (!currentUser) return [];
      const saved = localStorage.getItem(`eed_cart_${currentUser.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart when user signs in or out
  useEffect(() => {
    if (!currentUser) {
      setCart([]);
    } else {
      try {
        const saved = localStorage.getItem(`eed_cart_${currentUser.uid}`);
        setCart(saved ? JSON.parse(saved) : []);
      } catch {
        setCart([]);
      }
    }
  }, [currentUser]);

  // Persist cart per authenticated user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`eed_cart_${currentUser.uid}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  const addToCart = (product: DigitalProduct): boolean => {
    if (!currentUser) {
      openLoginModal({
        title: 'Login Required',
        message: 'Please log in to your account to add products to your cart and continue shopping.',
        redirectPath: `/products/${product.slug}` || '/products',
      });
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) return prev; // Digital products usually 1 per order
      return [...prev, { product, quantity: 1 }];
    });
    return true;
  };

  const removeFromCart = (productId: string) => {
    if (!currentUser) return;
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (currentUser) {
      localStorage.removeItem(`eed_cart_${currentUser.uid}`);
    }
    setCart([]);
  };

  const totalPrice = cart.reduce((acc, item) => {
    const price = item.product.salePrice ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
