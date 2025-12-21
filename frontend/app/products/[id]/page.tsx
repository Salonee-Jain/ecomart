"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Rating,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Remove,
  ShoppingCart,
} from "@mui/icons-material";
import { getToken, isAuthenticated } from "@/lib/auth";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  stock: number;
  sku: string;
  rating?: number;
  numReviews?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${params.id}`);
      
      if (!response.ok) throw new Error("Product not found");

      const data = await response.json();
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          productId: product?._id,
          quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add to cart");
      }

      setSuccessMessage("Added to cart!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product?.stock || 0)) {
      setQuantity(newQty);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading product...</Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error || "Product not found"}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/products")}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.image}
              alt={product.name}
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: 500,
                objectFit: "contain",
                p: 2,
              }}
            />
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {product.name}
            </Typography>

            {product.rating !== undefined && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Rating value={product.rating} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary">
                  ({product.numReviews || 0} reviews)
                </Typography>
              </Box>
            )}

            <Typography variant="h4" color="primary" fontWeight="bold" mb={2}>
              ${product.price.toFixed(2)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Chip
                label={product.category}
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              {product.brand && (
                <Chip label={product.brand} variant="outlined" />
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                SKU: {product.sku}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Typography variant="body2" color="text.secondary">
                  Availability:
                </Typography>
                {product.stock > 0 ? (
                  <Chip
                    label={`${product.stock} in stock`}
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip label="Out of stock" color="error" size="small" />
                )}
              </Box>
            </Box>

            {product.stock > 0 && (
              <>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Typography variant="body1" fontWeight="medium">
                    Quantity:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      sx={{
                        border: "1px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography
                      sx={{
                        minWidth: 40,
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      sx={{
                        border: "1px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  sx={{ py: 1.5 }}
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
