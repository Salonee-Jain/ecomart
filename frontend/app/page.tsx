"use client";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(res => {
      // Handle both res.data (axios response) and res.data.data (API response format)
      const productsData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProducts(productsData);
    }).catch(err => {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
      {products.map((p: any) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
