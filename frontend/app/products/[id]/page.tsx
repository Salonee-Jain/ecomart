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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Remove,
  ShoppingCart,
  Star,
  Edit,
  Delete,
} from "@mui/icons-material";
import { getToken, isAuthenticated } from "@/lib/auth";
import { createReview, updateReview, deleteReview } from "@/services/review.service";
import { getProfile } from "@/services/auth.service";

interface Review {
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  reviews?: Review[];
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
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
    if (isAuthenticated()) {
      fetchUserId();
    }
  }, [params.id]);

  const fetchUserId = async () => {
    try {
      const response = await getProfile();
      setUserId(response.data._id);
    } catch (err) {
      console.error("Failed to fetch user ID");
    }
  };

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

  const handleOpenReviewDialog = (reviewIndex?: number) => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (reviewIndex !== undefined && product?.reviews) {
      const review = product.reviews[reviewIndex];
      setEditingReview(reviewIndex);
      setReviewForm({ rating: review.rating, comment: review.comment });
    } else {
      setEditingReview(null);
      setReviewForm({ rating: 5, comment: "" });
    }
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setEditingReview(null);
    setReviewForm({ rating: 5, comment: "" });
  };

  const handleSubmitReview = async () => {
    if (!product) return;

    setError("");
    try {
      if (editingReview !== null) {
        await updateReview(product._id, editingReview, reviewForm);
        setSuccessMessage("Review updated successfully!");
      } else {
        await createReview(product._id, reviewForm);
        setSuccessMessage("Review added successfully!");
      }

      handleCloseReviewDialog();
      fetchProduct(); // Refresh product to show new review
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewIndex: number) => {
    if (!product || !confirm("Are you sure you want to delete this review?")) return;

    setError("");
    try {
      await deleteReview(product._id, reviewIndex);
      setSuccessMessage("Review deleted successfully!");
      fetchProduct(); // Refresh product
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete review");
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

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Customer Reviews
          </Typography>
          <Button
            variant="contained"
            startIcon={<Star />}
            onClick={() => handleOpenReviewDialog()}
          >
            Write a Review
          </Button>
        </Box>

        {product.reviews && product.reviews.length > 0 ? (
          <Grid container spacing={2}>
            {product.reviews.map((review, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box display="flex" gap={2}>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {review.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {review.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} my={0.5}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {review.comment}
                          </Typography>
                        </Box>
                      </Box>
                      {userId === review.user && (
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenReviewDialog(index)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteReview(index)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ py: 4, textAlign: "center" }}>
              <Star sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography color="text.secondary">
                No reviews yet. Be the first to review this product!
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleCloseReviewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReview !== null ? "Edit Review" : "Write a Review"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Rating
            </Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(_, newValue) =>
                setReviewForm({ ...reviewForm, rating: newValue || 5 })
              }
              size="large"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              placeholder="Share your thoughts about this product..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!reviewForm.comment.trim()}
          >
            {editingReview !== null ? "Update" : "Submit"} Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
