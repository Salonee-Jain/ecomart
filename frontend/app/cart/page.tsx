"use client";

import { useState, useEffect } from "react";
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
import { Add, Remove, Delete, ShoppingCart, ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getToken, isAuthenticated } from "@/lib/auth";

interface CartItem {
  _id?: string;
  product: string; // This is the product ID
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    productId: string | null;
    type: 'item' | 'all';
  }>({ open: false, productId: null, type: 'item' });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();
      setCartItems(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdating(productId);
    setError("");
    
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update quantity");
      }

      const data = await response.json();
      console.log("Update response:", data); // Debug log
      
      // Set items from the updated cart
      setCartItems(data.items || []);
      setSuccessMessage("Cart updated");
    } catch (err: any) {
      console.error("Update error:", err); // Debug log
      setError(err.message);
      // Fetch fresh data on error
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setDeleteDialog({ open: true, productId, type: 'item' });
  };

  const clearCart = async () => {
    setDeleteDialog({ open: true, productId: null, type: 'all' });
  };

  const handleDeleteConfirm = async () => {
    const { productId, type } = deleteDialog;
    setDeleteDialog({ open: false, productId: null, type: 'item' });

    if (type === 'item' && productId) {
      setUpdating(productId);
      setError("");
      
      try {
        const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (!response.ok) throw new Error("Failed to remove item");

        await fetchCart();
        setSuccessMessage("Item removed from cart");
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
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading cart...</Typography>
      </Container>
    );
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
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Add some products to get started!
        </Typography>
        <Button variant="contained" onClick={() => router.push("/products")}>
          Shop Now
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/products")}
        sx={{ mb: 3 }}
      >
        Continue Shopping
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h3" fontWeight={800}>
            Shopping Cart
          </Typography>
          <Chip 
            label={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`}
            color="primary"
            size="medium"
          />
        </Box>
        {cartItems.length > 0 && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={clearCart}
            startIcon={<Delete />}
            size="small"
          >
            Clear Cart
          </Button>
        )}
      </Box>

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
              sx={{ 
                mb: 2,
                opacity: updating === item.product ? 0.6 : 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                },
                animation: `fadeIn 0.3s ease ${index * 0.1}s backwards`,
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
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
          <Card sx={{ position: 'sticky', top: 80 }}>
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
                  fontSize: '1.1rem',
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
  );
}
