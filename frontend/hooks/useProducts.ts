"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";

interface UseProductsOptions {
  limit?: number;
}

const useProducts = (options?: UseProductsOptions) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");
    
    getProducts()
      .then((response) => {
        let products = response.products || [];
        // Apply limit if specified
        if (options?.limit && options.limit > 0) {
          products = products.slice(0, options.limit);
        }
        setProducts(products);
      })
      .catch((err) => {
        setError(err.message || "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, [options?.limit]);

  return { products, loading, error };
};

export default useProducts;
