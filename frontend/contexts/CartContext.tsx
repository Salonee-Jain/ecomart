"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getToken, isAuthenticated } from "@/lib/auth";

interface CartItem {
  _id?: string;
  product: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number, productData?: Partial<CartItem>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();
      setItems(data.items || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number, productData?: Partial<CartItem>) => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    // Optimistic update
    if (productData) {
      const optimisticItem: CartItem = {
        product: productId,
        name: productData.name || "",
        sku: productData.sku || "",
        image: productData.image || "",
        price: productData.price || 0,
        quantity,
        stock: productData.stock,
      };

      const existingIndex = items.findIndex((item) => item.product === productId);
      if (existingIndex >= 0) {
        const updatedItems = [...items];
        updatedItems[existingIndex].quantity += quantity;
        setItems(updatedItems);
      } else {
        setItems([...items, optimisticItem]);
      }
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add to cart");
      }

      await refreshCart();
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Revert optimistic update on error
      await refreshCart();
      throw err;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }

    // Optimistic update
    const previousItems = [...items];
    setItems(items.map((item) => 
      item.product === productId ? { ...item, quantity } : item
    ));

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update cart");
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Revert on error
      setItems(previousItems);
      throw err;
    }
  };

  const removeItem = async (productId: string) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(items.filter((item) => item.product !== productId));

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to remove item");

      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Revert on error
      setItems(previousItems);
      throw err;
    }
  };

  const clearCart = async () => {
    // Optimistic update
    const previousItems = [...items];
    setItems([]);

    try {
      const response = await fetch("http://localhost:5000/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to clear cart");

      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Revert on error
      setItems(previousItems);
      throw err;
    }
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.product === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((item) => item.product === productId);
    return item?.quantity || 0;
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
