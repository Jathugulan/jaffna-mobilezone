import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CartItem, Product } from '../types';
import { cartApi } from '../api/cart.api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (product: Product, quantity?: number, variant?: Record<string, unknown>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jmz_guest_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync with server if logged in
  const fetchServerCart = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setItems(res.data.items || []);
      }
    } catch {
      // Keep local items on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      fetchServerCart();
    } else {
      const saved = localStorage.getItem('jmz_guest_cart');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      }
    }
  }, [isAuthenticated, isAuthLoading]);

  // Save guest cart locally
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('jmz_guest_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (product: Product, quantity: number = 1, variant?: Record<string, unknown>) => {
    if (isAuthenticated) {
      try {
        const res = await cartApi.addToCart(product._id, quantity, variant);
        if (res.success && res.data) {
          setItems(res.data.items || []);
        }
      } catch {
        // Fallback to local update
        addLocalItem(product, quantity, variant);
      }
    } else {
      addLocalItem(product, quantity, variant);
    }
    setIsCartDrawerOpen(true);
  };

  const addLocalItem = (product: Product, quantity: number, variant?: Record<string, unknown>) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product._id === product._id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity, variant }];
    });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    if (isAuthenticated) {
      try {
        const res = await cartApi.updateCartItem(productId, quantity);
        if (res.success && res.data) {
          setItems(res.data.items || []);
          return;
        }
      } catch {
        // Continue to local update
      }
    }
    setItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await cartApi.removeCartItem(productId);
        if (res.success && res.data) {
          setItems(res.data.items || []);
          return;
        }
      } catch {
        // Fallback to local
      }
    }
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch {
        // Ignore
      }
    }
    setItems([]);
    localStorage.removeItem('jmz_guest_cart');
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const regular = item.product.price || 0;
    return sum + regular * item.quantity;
  }, 0);

  const discount = items.reduce((sum, item) => {
    const regular = item.product.price || 0;
    const offer = item.product.offerPrice;
    if (offer && offer < regular) {
      return sum + (regular - offer) * item.quantity;
    }
    return sum;
  }, 0);

  const deliveryFee = subtotal > 0 ? (subtotal > 100000 ? 0 : 500) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        deliveryFee,
        total,
        isLoading,
        isCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
