"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Add, Remove, Delete, ShoppingCart } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isAuthenticated } from "@/lib/auth";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import PageContainer from "@/components/PageContainer";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { items: cartItems, loading, updateQuantity, removeItem, clearCart } = useCart();
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    productId: string | null;
    type: 'item' | 'all';
  }>({ open: false, productId: null, type: 'item' });

  if (!isAuthenticated()) {
    router.push("/login");
    return null;
  }

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdating(productId);
    setError("");

    try {
      await updateQuantity(productId, quantity);
      setSuccessMessage("Cart updated");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setDeleteDialog({ open: true, productId, type: 'item' });
  };

  const handleClearCart = async () => {
    setDeleteDialog({ open: true, productId: null, type: 'all' });
  };

  const handleDeleteConfirm = async () => {
    const { productId, type } = deleteDialog;
    setDeleteDialog({ open: false, productId: null, type: 'item' });

    if (type === 'item' && productId) {
      setUpdating(productId);
      setError("");

      try {
        await removeItem(productId);
        setSuccessMessage("Item removed from cart");
        setTimeout(() => setSuccessMessage(""), 2000);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setUpdating(null);
      }
    } else if (type === 'all') {
      setLoading(true);
      try {
        const deletePromises = cartItems.map(item =>
          fetch(`http://localhost:5000/api/cart/${item.product}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          })
        );

        await Promise.all(deletePromises);
        await fetchCart();
        setSuccessMessage("Cart cleared");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, productId: null, type: 'item' });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 0;
      return total + (itemPrice * itemQuantity);
    }, 0);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return <LoadingState message="Loading cart..." />;
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart sx={{ fontSize: 80, color: "#767676" }} />}
        title="Your Cart is Empty"
        message="Add some products to get started!"
        actionLabel="Shop Now"
        onAction={() => router.push("/products")}
      />
    );
  }

  return (
    <PageContainer>
      <Container sx={{ py: 2 }}>
        <BackButton
          label="Continue Shopping"
          onClick={() => router.push("/products")}
        />

        <PageHeader
          icon={<ShoppingCart sx={{ fontSize: 36, color: "#EB1700" }} />}
          title="Shopping Cart"
          action={
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`}
                sx={{
                  bgcolor: "#EB1700",
                  color: "white",
                  fontWeight: 600,
                }}
                size="medium"
              />
              {cartItems.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={clearCart}
                  startIcon={<Delete />}
                  sx={{
                    borderColor: "#E8E8E8",
                    color: "#191919",
                    "&:hover": {
                      borderColor: "#EB1700",
                      backgroundColor: "#FFF5F5",
                      color: "#EB1700",
                    },
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Clear Cart
                </Button>
              )}
            </Box>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item, index) => (
              <Card
                key={item.product}
                elevation={0}
                sx={{
                  mb: 2,
                  opacity: updating === item.product ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  overflow: "hidden",
                  background: "white",
                  border: "1px solid #E8E8E8",
                  '&:hover': {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                    borderColor: "#D0D0D0",
                  },
                }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3} sm={2} md={1.5}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: "100%",
                          maxWidth: 80,
                          height: "auto",
                          aspectRatio: "1/1",
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                    </Grid>
                    <Grid item xs={9} sm={10} md={4.5}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${(item.price || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        SKU: {item.sku}
                      </Typography>
                    </Grid>
                    <Grid item xs={7} sm={6} md={3}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.product, item.quantity - 1)
                          }
                          disabled={
                            item.quantity <= 1 || updating === item.product
                          }
                          color="primary"
                          sx={{
                            border: '1px solid',
                            borderColor: 'primary.main',
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography fontWeight="bold" minWidth={40} textAlign="center" fontSize="1.1rem">
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(item.product, item.quantity + 1)
                          }
                          disabled={updating === item.product}
                          color="primary"
                          sx={{
                            border: '1px solid',
                            borderColor: 'primary.main',
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={3} sm={4} md={2}>
                      <Typography variant="h6" fontWeight="bold" textAlign="right">
                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={2} sm={2} md={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeItem(item.product)}
                        disabled={updating === item.product}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                position: 'sticky',
                top: 80,
                borderRadius: 2,
                background: "white",
                border: "1px solid #E8E8E8",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent>
                <Typography variant="h5" fontWeight={700} mb={2}>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography color="text.secondary">
                    Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}):
                  </Typography>
                  <Typography fontWeight="medium">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography color="text.secondary">Shipping:</Typography>
                  <Chip
                    label="FREE"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography color="text.secondary">Tax (10%):</Typography>
                  <Typography fontWeight="medium">
                    ${(calculateTotal() * 0.1).toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    ${(calculateTotal() * 1.1).toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  startIcon={<ShoppingCart />}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: "#EB1700",
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": {
                      background: "#C91400",
                      boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                    },
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.dark" textAlign="center">
                    🎉 You're eligible for FREE shipping!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            {deleteDialog.type === 'all' ? 'Clear Cart?' : 'Remove Item?'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {deleteDialog.type === 'all'
                ? `Are you sure you want to remove all ${cartItems.length} items from your cart? This action cannot be undone.`
                : 'Are you sure you want to remove this item from your cart?'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              autoFocus
            >
              {deleteDialog.type === 'all' ? 'Clear Cart' : 'Remove'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
          message={successMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </PageContainer>
  );
}
