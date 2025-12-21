"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";

const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((p) => {
      let products = p.products;
      setProducts(products);
    }).finally(() => setLoading(false));
  }, []);

  return { products, loading };
};

export default useProducts;
