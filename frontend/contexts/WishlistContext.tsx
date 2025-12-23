"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
import { getToken, isAuthenticated } from "@/lib/auth";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistCount: number;
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated()) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.WISHLIST, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to fetch wishlist");

      const data = await response.json();
      setWishlistItems(data.products || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.WISHLIST + `/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add to wishlist");
      }

      await refreshWishlist();
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    // Optimistic update
    const previousItems = [...wishlistItems];
    setWishlistItems(wishlistItems.filter((item) => item._id !== productId));

    try {
      const response = await fetch(API_ENDPOINTS.WISHLIST + `/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to remove from wishlist");

      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Revert on error
      setWishlistItems(previousItems);
      throw err;
    }
  };

  const clearWishlist = async () => {
    // Optimistic update
    const previousItems = [...wishlistItems];
    setWishlistItems([]);

    try {
      const response = await fetch(API_ENDPOINTS.WISHLIST, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to clear wishlist");

      await refreshWishlist();
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Revert on error
      setWishlistItems(previousItems);
      throw err;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
