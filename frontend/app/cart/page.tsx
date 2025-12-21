"use client";

import { useEffect, useState } from "react";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "@/services/cart.service";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ⛔ wait until auth check finishes
    if (authLoading) return;

    // 🔒 not logged in → redirect
    if (!user) {
      router.push("/login");
      return;
    }

    // ✅ logged in → load cart
    loadCart();
  }, [authLoading, user]);

  const updateQuantity = async (
    productId: string,
    quantity: number
  ) => {
    if (quantity < 1) return;
    await updateCartItem(productId, quantity);
    loadCart();
  };

  const removeItem = async (productId: string) => {
    await removeCartItem(productId);
    loadCart();
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading cart...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push("/")}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum: number, item: any) =>
      sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item: any) => (
          <div
            key={item.product._id}
            className="flex items-center justify-between border p-4 rounded"
          >
            <div>
              <h2 className="font-semibold">
                {item.product.name}
              </h2>
              <p className="text-sm text-gray-600">
                ${item.product.price}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                className="px-2 border rounded"
                onClick={() =>
                  updateQuantity(
                    item.product._id,
                    item.quantity - 1
                  )
                }
              >
                −
              </button>

              <span>{item.quantity}</span>

              <button
                className="px-2 border rounded"
                onClick={() =>
                  updateQuantity(
                    item.product._id,
                    item.quantity + 1
                  )
                }
              >
                +
              </button>

              <button
                onClick={() => removeItem(item.product._id)}
                className="text-red-600 ml-4"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Total: ${total.toFixed(2)}
        </h2>

        <button
          onClick={() => router.push("/checkout")}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
