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
  Add,
  Remove,
  ShoppingCart,
  Star,
  Edit,
  Delete,
  FavoriteBorder,
  Favorite,
  Share,
} from "@mui/icons-material";
import { getToken, isAuthenticated } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/api-config";
import { createReview, updateReview, deleteReview } from "@/services/review.service";
import { getProfile } from "@/services/auth.service";
import LoadingState from "@/components/LoadingState";
import BackButton from "@/components/BackButton";
import PageContainer from "@/components/PageContainer";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

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
  const { addToCart: addToCartContext, getItemQuantity, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
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
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
    if (isAuthenticated()) {
      fetchUserId();
    }
  }, [params.id]);

  // Update quantity when product loads or cart changes
  useEffect(() => {
    if (product) {
      const cartQuantity = getItemQuantity(product._id);
      setQuantity(cartQuantity > 0 ? cartQuantity : 1);
    }
  }, [product, getItemQuantity]);

  const fetchUserId = async () => {
    try {
      const response = await getProfile();
      setUserId(response.data._id);
    } catch (err) {
      console.error("Failed to fetch user ID");
    }
  };

  const fetchProduct = async () => {
    if (!params.id) return;
    const productId = Array.isArray(params.id) ? params.id[0] : params.id;
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(productId));

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

    // Validate stock availability
    if (!product || product.stock < 1) {
      setError("Product is out of stock");
      return;
    }

    if (quantity > product.stock) {
      setError(`Only ${product.stock} items available in stock`);
      return;
    }

    setAddingToCart(true);
    setError("");

    try {
      // Use CartContext's addToCart which automatically refreshes the cart
      await addToCartContext(product._id, quantity, {
        name: product.name,
        sku: product.sku,
        image: product.image,
        price: product.price,
        stock: product.stock,
      });

      setSuccessMessage("Added to cart!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add to cart");
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
      fetchProduct();
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
      fetchProduct();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!product) return;

    setWishlistLoading(true);
    setError("");
    try {
      await toggleWishlist(product._id);
      setSuccessMessage(
        isInWishlist(product._id)
          ? "Removed from wishlist!"
          : "Added to wishlist!"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading product..." />;
  }

  if (error || !product) {
    return (
      <PageContainer>
        <Container sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error || "Product not found"}
          </Alert>
          <BackButton label="Back to Products" onClick={() => router.push("/products")} />
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container sx={{ py: 4 }}>
        <BackButton label="Back" onClick={() => router.back()} />

        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #E8E8E8",
                background: "white",
              }}
            >
              <CardMedia
                component="img"
                image={product.image}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 500,
                  objectFit: "contain",
                  p: 4,
                  backgroundColor: "#FAFAFA",
                }}
              />
            </Card>
          </Grid>

          {/* Product Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              {/* Category & Brand */}
              <Box mb={2} display="flex" gap={1}>
                <Chip
                  label={product.category}
                  size="small"
                  sx={{
                    bgcolor: "#FFF5F5",
                    color: "#EB1700",
                    fontWeight: 600,
                    border: "none",
                  }}
                />
                {product.brand && (
                  <Chip
                    label={product.brand}
                    size="small"
                    sx={{
                      bgcolor: "#FAFAFA",
                      color: "#767676",
                      border: "1px solid #E8E8E8",
                    }}
                  />
                )}
              </Box>

              {/* Product Name */}
              <Typography
                variant="h3"
                fontWeight={700}
                gutterBottom
                sx={{
                  color: "#191919",
                  letterSpacing: "-0.5px",
                  mb: 2,
                }}
              >
                {product.name}
              </Typography>

              {/* Rating */}
              {product.rating !== undefined && (
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Rating value={product.rating} readOnly precision={0.5} size="small" />
                  <Typography variant="body2" color="#767676" fontWeight={500}>
                    {product.rating.toFixed(1)} ({product.numReviews || 0} reviews)
                  </Typography>
                </Box>
              )}

              {/* Price */}
              <Typography
                variant="h4"
                fontWeight={700}
                mb={3}
                sx={{
                  color: "#EB1700",
                  fontSize: "2rem",
                }}
              >
                ${product.price.toFixed(2)}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography
                variant="body1"
                paragraph
                sx={{
                  color: "#191919",
                  lineHeight: 1.7,
                  mb: 3,
                }}
              >
                {product.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Stock & SKU */}
              <Box mb={3}>
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                  <Typography variant="body2" color="#767676" fontWeight={500}>
                    Availability:
                  </Typography>
                  {product.stock > 0 ? (
                    <Chip
                      label={`${product.stock} in stock`}
                      size="small"
                      sx={{
                        bgcolor: product.stock <= 5 ? "#FFF3E0" : "#E8F5E9",
                        color: product.stock <= 5 ? "#E65100" : "#2E7D32",
                        fontWeight: 600,
                      }}
                    />
                  ) : (
                    <Chip
                      label="Out of stock"
                      size="small"
                      sx={{
                        bgcolor: "#FFEBEE",
                        color: "#C62828",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                {product.stock > 0 && product.stock <= 5 && (
                  <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>
                    Only {product.stock} items left - Order soon!
                  </Alert>
                )}
                <Typography variant="body2" color="#767676">
                  SKU: {product.sku}
                </Typography>
              </Box>

              {product.stock > 0 && (
                <>
                  {/* Quantity Selector */}
                  <Box mb={3}>
                    <Typography variant="body1" fontWeight={600} mb={1.5} color="#191919">
                      Quantity
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <IconButton
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        sx={{
                          border: "2px solid #E8E8E8",
                          borderRadius: 2,
                          "&:hover": {
                            borderColor: "#EB1700",
                            backgroundColor: "#FFF5F5",
                          },
                          "&:disabled": {
                            borderColor: "#F0F0F0",
                          },
                        }}
                      >
                        <Remove sx={{ color: quantity <= 1 ? "#D0D0D0" : "#EB1700" }} />
                      </IconButton>
                      <Typography
                        sx={{
                          minWidth: 50,
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "1.25rem",
                          color: "#191919",
                        }}
                      >
                        {quantity}
                      </Typography>
                      <IconButton
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        sx={{
                          border: "2px solid #E8E8E8",
                          borderRadius: 2,
                          "&:hover": {
                            borderColor: "#EB1700",
                            backgroundColor: "#FFF5F5",
                          },
                          "&:disabled": {
                            borderColor: "#F0F0F0",
                          },
                        }}
                      >
                        <Add sx={{ color: quantity >= product.stock ? "#D0D0D0" : "#EB1700" }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Add to Cart Button */}
                  <Box display="flex" gap={2} mb={2}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<ShoppingCart />}
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      sx={{
                        py: 1.8,
                        fontSize: "1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: 2,
                        background: "#EB1700",
                        boxShadow: "none",
                        "&:hover": {
                          background: "#C91400",
                          boxShadow: "0 4px 12px rgba(235, 23, 0, 0.25)",
                        },
                        "&:disabled": {
                          background: "#F0F0F0",
                          color: "#D0D0D0",
                        },
                      }}
                    >
                      {addingToCart ? "Adding..." : "Add to Cart"}
                    </Button>

                    <IconButton
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                      sx={{
                        border: "2px solid #E8E8E8",
                        borderRadius: 2,
                        width: 56,
                        height: 56,
                        "&:hover": {
                          borderColor: "#EB1700",
                          backgroundColor: "#FFF5F5",
                        },
                      }}
                    >
                      {product && isInWishlist(product._id) ? (
                        <Favorite sx={{ color: "#EB1700", fontSize: 28 }} />
                      ) : (
                        <FavoriteBorder sx={{ color: "#767676", fontSize: 28 }} />
                      )}
                    </IconButton>
                  </Box>
                </>
              )}

              {/* Success/Error Messages */}
              {successMessage && (
                <Alert
                  severity="success"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    bgcolor: "#E8F5E9",
                    border: "1px solid #81C784",
                  }}
                >
                  {successMessage}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                  }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Reviews Section */}
        <Box sx={{ mt: 8 }}>
          <Box
            sx={{
              mb: 4,
              py: 3,
              px: 4,
              borderRadius: 2,
              background: "#FAFAFA",
              border: "1px solid #E8E8E8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: "#191919", mb: 0.5 }}>
                Customer Reviews
              </Typography>
              <Typography variant="body2" color="#767676">
                {product.numReviews || 0} {product.numReviews === 1 ? "review" : "reviews"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Star />}
              onClick={() => handleOpenReviewDialog()}
              sx={{
                background: "#EB1700",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                boxShadow: "none",
                "&:hover": {
                  background: "#C91400",
                  boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                },
              }}
            >
              Write a Review
            </Button>
          </Box>

          {product.reviews && product.reviews.length > 0 ? (
            <Grid container spacing={3}>
              {product.reviews.map((review, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #E8E8E8",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        borderColor: "#D0D0D0",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box display="flex" gap={2} flex={1}>
                          <Avatar
                            sx={{
                              bgcolor: "#EB1700",
                              width: 48,
                              height: 48,
                              fontSize: "1.25rem",
                              fontWeight: 600,
                            }}
                          >
                            {review.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="body1" fontWeight={600} color="#191919">
                              {review.name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} my={0.5}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Typography variant="caption" color="#767676">
                                {new Date(review.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1.5, color: "#191919", lineHeight: 1.6 }}>
                              {review.comment}
                            </Typography>
                          </Box>
                        </Box>
                        {userId === review.user && (
                          <Box display="flex" gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenReviewDialog(index)}
                              sx={{
                                color: "#EB1700",
                                "&:hover": {
                                  backgroundColor: "#FFF5F5",
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteReview(index)}
                              sx={{
                                color: "#C62828",
                                "&:hover": {
                                  backgroundColor: "#FFEBEE",
                                },
                              }}
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
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #E8E8E8",
                background: "#FAFAFA",
              }}
            >
              <CardContent sx={{ py: 6, textAlign: "center" }}>
                <Star sx={{ fontSize: 60, color: "#D0D0D0", mb: 2 }} />
                <Typography variant="h6" color="#767676" fontWeight={600} mb={1}>
                  No reviews yet
                </Typography>
                <Typography variant="body2" color="#767676">
                  Be the first to review this product!
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Review Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={handleCloseReviewDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#191919" }}>
            {editingReview !== null ? "Edit Review" : "Write a Review"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom fontWeight={600} color="#191919">
                Rating
              </Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(_, newValue) =>
                  setReviewForm({ ...reviewForm, rating: newValue || 5 })
                }
                size="large"
                sx={{ mb: 3 }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#EB1700",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#EB1700",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#EB1700",
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={handleCloseReviewDialog}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#767676",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitReview}
              disabled={!reviewForm.comment.trim()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                background: "#EB1700",
                borderRadius: 2,
                px: 3,
                boxShadow: "none",
                "&:hover": {
                  background: "#C91400",
                  boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                },
              }}
            >
              {editingReview !== null ? "Update" : "Submit"} Review
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </PageContainer>
  );
}
