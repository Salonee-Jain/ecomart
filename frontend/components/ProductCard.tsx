"use client";

import { addToCart } from "@/services/cart.service";
import { useRouter } from "next/navigation";

type Props = {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  };
};

export default function ProductCard({ product }: Props) {
  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
      });
      router.push("/cart");
    } catch (err) {
      alert("Please login to add items to cart");
      router.push("/login");
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col">
      <img
        src={product.image}
        alt={product.name}
        className="h-48 object-cover rounded mb-3"
      />

      <h2 className="font-semibold text-lg">{product.name}</h2>
      <p className="text-sm text-gray-600 flex-1">
        {product.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-green-600">
          ${product.price}
        </span>

        <button
          onClick={handleAddToCart}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
