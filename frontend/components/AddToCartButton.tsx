"use client";

import { useState, useEffect } from "react";
import { Button, CircularProgress, Box, IconButton, Typography } from "@mui/material";
import { ShoppingCartOutlined, CheckCircle, Add, Remove } from "@mui/icons-material";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  variant?: "contained" | "outlined";
  size?: "small" | "medium" | "large";
  productData?: {
    name: string;
    sku: string;
    image: string;
    price: number;
    stock?: number;
  };
}

export default function AddToCartButton({ 
  productId, 
  disabled = false,
  variant = "contained",
  size = "medium",
  productData
}: AddToCartButtonProps) {
  const router = useRouter();
  const { addToCart, updateQuantity, isInCart, getItemQuantity, error: cartError } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const quantity = getItemQuantity(productId);
  const inCart = isInCart(productId);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await addToCart(productId, 1, productData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      console.error("Failed to add to cart:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (e: React.MouseEvent, newQuantity: number) => {
    e.stopPropagation();
    
    if (newQuantity < 1) return;
    
    setLoading(true);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (err: any) {
      console.error("Failed to update quantity:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSizeProps = () => {
    switch(size) {
      case "small":
        return { py: 0.8, fontSize: "0.85rem" };
      case "large":
        return { py: 1.6, fontSize: "1rem" };
      default:
        return { py: 1.3, fontSize: "0.95rem" };
    }
  };

  // If item is in cart, show quantity controls
  if (inCart && !success) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          border: "1px solid #EB1700",
          borderRadius: 2,
          backgroundColor: "#FFF5F5",
          p: 0.5,
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => handleUpdateQuantity(e, quantity - 1)}
          disabled={loading || quantity <= 1}
          sx={{
            color: "#EB1700",
            "&:hover": { backgroundColor: "#FFE5E5" },
          }}
        >
          <Remove fontSize="small" />
        </IconButton>
        
        <Typography
          sx={{
            fontWeight: 700,
            color: "#EB1700",
            minWidth: "30px",
            textAlign: "center",
            fontSize: "0.95rem",
          }}
        >
          {loading ? "..." : quantity}
        </Typography>
        
        <IconButton
          size="small"
          onClick={(e) => handleUpdateQuantity(e, quantity + 1)}
          disabled={loading}
          sx={{
            color: "#EB1700",
            "&:hover": { backgroundColor: "#FFE5E5" },
          }}
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleAdd}
        disabled={loading || disabled || success}
        startIcon={
          loading ? (
            <CircularProgress size={18} sx={{ color: "#EB1700" }} />
          ) : success ? (
            <CheckCircle sx={{ fontSize: 20 }} />
          ) : (
            <ShoppingCartOutlined sx={{ fontSize: 20 }} />
          )
        }
        sx={{
          ...getSizeProps(),
          fontWeight: 600,
          textTransform: "none",
          borderRadius: 2,
          borderColor: success ? "#EB1700" : "#E8E8E8",
          color: success ? "#EB1700" : "#767676",
          borderWidth: "1px",
          backgroundColor: "transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: success ? "#C91400" : "#D0D0D0",
            backgroundColor: success ? "#FFF5F5" : "#FAFAFA",
            borderWidth: "1px",
          },
          "&:active": {
            transform: "scale(0.98)",
            borderColor: "#EB1700",
            backgroundColor: "#EB1700",
            color: "white",
            "& .MuiSvgIcon-root": {
              color: "white",
            },
          },
          "&:disabled": {
            borderColor: success ? "#EB1700" : "#E8E8E8",
            color: success ? "#EB1700" : "#C0C0C0",
            backgroundColor: "transparent",
            opacity: success ? 1 : 0.6,
          },
        }}
      >
        {loading ? "Adding..." : success ? "Added to Cart!" : "Add to Cart"}
      </Button>
    </Box>
  );
}
