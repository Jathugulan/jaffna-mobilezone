import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Product } from '../types';
import { wishlistApi } from '../api/wishlist.api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jmz_guest_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await wishlistApi.getWishlist();
      if (res.success && res.data) {
        setWishlist(res.data.products || []);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('jmz_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p._id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    const exists = isInWishlist(product._id);
    if (exists) {
      await removeFromWishlist(product._id);
    } else {
      if (isAuthenticated) {
        try {
          await wishlistApi.addToWishlist(product._id);
        } catch {
          // Fallback to local
        }
      }
      setWishlist((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (isAuthenticated) {
      try {
        await wishlistApi.removeFromWishlist(productId);
      } catch {
        // Fallback
      }
    }
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
