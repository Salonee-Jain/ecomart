"use client";

import { useState } from "react";
import { Button, CircularProgress, Box } from "@mui/material";
import { ShoppingCartOutlined, CheckCircle } from "@mui/icons-material";
import { apiFetch } from "@/lib/api";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export default function AddToCartButton({ productId, disabled = false }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      await apiFetch("/cart", "POST", {
        productId,
        quantity: 1
      }, token || "");

      setSuccess(true);

      // Reset success state after animation
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      console.error("Failed to add to cart:", err.message);
    }

    setLoading(false);
  };

  return (
    <Box>
      <Button
        fullWidth
        variant="contained"
        onClick={handleAdd}
        disabled={loading || disabled || success}
        startIcon={
          loading ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : success ? (
            <CheckCircle />
          ) : (
            <ShoppingCartOutlined />
          )
        }
        sx={{
          py: 1.3,
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.95rem",
          borderRadius: 2,
          background: success ? "#10B981" : "#EB1700",
          boxShadow: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            background: success ? "#059669" : "#C91400",
            boxShadow: success
              ? "0 2px 8px rgba(16, 185, 129, 0.3)"
              : "0 2px 8px rgba(235, 23, 0, 0.3)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
          "&:disabled": {
            background: success ? "#10B981" : "#E0E0E0",
            color: "white",
            opacity: success ? 1 : 0.6,
          },
        }}
      >
        {loading ? "Adding..." : success ? "Added!" : "Add to Cart"}
      </Button>
    </Box>
  );
}
