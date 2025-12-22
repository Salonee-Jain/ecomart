"use client";

import { useState, useEffect } from "react";
import { Button, CircularProgress, Box, IconButton, Typography } from "@mui/material";
import { ShoppingCartOutlined, CheckCircle, Add, Remove } from "@mui/icons-material";
import { apiFetch } from "@/lib/api";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  variant?: "contained" | "outlined";
  size?: "small" | "medium" | "large";
}

export default function AddToCartButton({ 
  productId, 
  disabled = false,
  variant = "contained",
  size = "medium"
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(0);

  // Check if item is in cart on mount and when navigating back
  useEffect(() => {
    checkCartStatus();
    
    // Also check when window gains focus (user navigates back)
    const handleFocus = () => {
      checkCartStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [productId]);

  const checkCartStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setInCart(false);
        setQuantity(0);
        return;
      }

      const cart = await apiFetch("/cart", "GET", undefined, token);
      const cartItem = cart.items?.find((item: any) => item.product._id === productId);
      
      if (cartItem) {
        setInCart(true);
        setQuantity(cartItem.quantity);
      } else {
        setInCart(false);
        setQuantity(0);
      }
    } catch (err) {
      console.error("Failed to check cart status:", err);
      setInCart(false);
      setQuantity(0);
    }
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");

      await apiFetch("/cart", "POST", {
        productId,
        quantity: 1
      }, token || "");

      setInCart(true);
      setQuantity(1);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      console.error("Failed to add to cart:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (e: React.MouseEvent, newQuantity: number) => {
    e.stopPropagation();
    
    if (newQuantity < 1) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Update cart by posting new quantity
      const response = await apiFetch("/cart", "POST", {
        productId,
        quantity: newQuantity
      }, token || "");

      // Update local state after successful API call
      setQuantity(newQuantity);
      
      // Optionally refresh cart status to ensure sync
      await checkCartStatus();
    } catch (err: any) {
      console.error("Failed to update quantity:", err.message);
      // Revert to previous quantity on error
      await checkCartStatus();
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
          onClick={(e) => updateQuantity(e, quantity - 1)}
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
          onClick={(e) => updateQuantity(e, quantity + 1)}
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
