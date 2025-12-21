"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/services/cart.service";

export const useCart = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return { cart, loading, refreshCart };
};
