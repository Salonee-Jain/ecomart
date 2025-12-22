"use client";

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

export default function ProductCard({
  product,
  showDescription = false
}: ProductCardProps) {
  const router = useRouter();

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
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-4px)",
          borderColor: "#D0D0D0",
        },
      }}
      onClick={() => router.push(`/products/${product._id}`)}
    >
      <CardMedia
        component="img"
        height="220"
        image={product.image}
        alt={product.name}
        sx={{
          objectFit: "cover",
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          p: 3,
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
            fontSize: showDescription ? "1rem" : "1.1rem",
            mb: 1,
          }}
        >
          {product.name}
        </Typography>

        {showDescription && product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              color: "#767676",
              minHeight: "48px",
            }}
          >
            {product.description}
          </Typography>
        )}

        <Box sx={{ mt: showDescription ? 0 : "auto" }}>
          <Typography
            variant="h5"
            fontWeight={700}
            mb={2}
            sx={{
              color: "#EB1700",
              fontSize: showDescription ? "1.4rem" : "1.5rem",
            }}
          >
            ${product.price.toFixed(2)}
          </Typography>
          <Box onClick={(e) => e.stopPropagation()}>
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
