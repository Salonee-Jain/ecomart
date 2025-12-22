"use client";

import React, { useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    stock?: number;
  };
  showDescription?: boolean;
}

function ProductCard({
  product,
  showDescription = false
}: ProductCardProps) {
  const router = useRouter();

  // Memoize click handler to prevent unnecessary re-renders
  const handleCardClick = useCallback(() => {
    router.push(`/products/${product._id}`);
  }, [router, product._id]);

  // Memoize stop propagation handler
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        borderRadius: showDescription ? 2 : 3,
        overflow: "hidden",
        background: "white",
        border: "1px solid #E8E8E8",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform, box-shadow", // Optimize for animations
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-4px)",
          borderColor: "#D0D0D0",
        },
        "&:active": {
          transform: "translateY(-2px)",
        },
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="img"
        height="180"
        image={product.image}
        alt={product.name}
        loading="lazy" // Lazy load images for better performance
        sx={{
          objectFit: "contain",
          backgroundColor: "#f0f0f0",
        // Placeholder color while loading
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          p: 2.5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          noWrap
          fontWeight={600}
          sx={{
            color: "#191919",
            fontSize: showDescription ? "0.95rem" : "1rem",
            mb: 0.5,
          }}
        >
          {product.name}
        </Typography>

        {showDescription && product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              color: "#767676",
              minHeight: "40px",
              fontSize: "0.875rem",
            }}
          >
            {product.description}
          </Typography>
        )}

        <Box sx={{ mt: showDescription ? 0 : "auto" }}>
          <Typography
            variant="h5"
            fontWeight={700}
            mb={1.5}
            sx={{
              color: "#EB1700",
              fontSize: showDescription ? "1.25rem" : "1.35rem",
            }}
          >
            ${product.price.toFixed(2)}
          </Typography>
          <Box onClick={handleButtonClick}>
            <AddToCartButton
              productId={product._id}
              disabled={product.stock === 0}
            />
          </Box>
          {product.stock === 0 && (
            <Typography variant="caption" color="error" display="block" mt={1}>
              Out of Stock
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ProductCard);
