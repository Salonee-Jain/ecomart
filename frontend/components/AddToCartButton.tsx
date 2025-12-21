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
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : success ? (
            <CheckCircle />
          ) : (
            <ShoppingCartOutlined />
          )
        }
        sx={{
          py: 1.5,
          fontWeight: 700,
          textTransform: "none",
          fontSize: "1rem",
          borderRadius: 2,
          background: success
            ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            background: success
              ? "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)"
              : "linear-gradient(135deg, #5568d3 0%, #6a4190 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
          "&:disabled": {
            background: success
              ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
              : "#ccc",
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
