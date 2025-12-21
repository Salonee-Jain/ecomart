"use client";

import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

export default function HomePage() {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Eco-Friendly Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
