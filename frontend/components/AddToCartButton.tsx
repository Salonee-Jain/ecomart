"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleAdd = async () => {
    setLoading(true);
    setMsg("");

    try {
      const token = localStorage.getItem("token"); // your stored JWT

      const res = await apiFetch("/cart", "POST", {
        productId,
        quantity: 1
      }, token || "");

      setMsg("Added to cart!");
    } catch (err: any) {
      setMsg(err.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>

      {msg && <p className="text-sm mt-2 text-green-600">{msg}</p>}
    </div>
  );
}
