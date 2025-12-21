"use client";
import { useEffect, useState } from "react";
import { getCart } from "@/services/cart.service";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);

  useEffect(() => {
    getCart().then(res => setCart(res.data));
  }, []);

  if (!cart) return null;

  return (
    <div className="p-6">
      {cart.items.map((item: any) => (
        <div key={item.product} className="flex justify-between">
          <span>{item.product.name}</span>
          <span>{item.quantity}</span>
        </div>
      ))}
    </div>
  );
}
