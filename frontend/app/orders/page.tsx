"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  Visibility,
  ArrowBack,
} from "@mui/icons-material";
import { getToken, isAuthenticated } from "@/lib/auth";

interface Order {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders/my", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (order: Order) => {
    if (order.isCancelled) return "error";
    if (order.isDelivered) return "success";
    if (order.isPaid) return "info";
    return "warning";
  };

  const getStatusText = (order: Order) => {
    if (order.isCancelled) return "Cancelled";
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Processing";
    return "Pending Payment";
  };

  const getStatusIcon = (order: Order) => {
    if (order.isCancelled) return <Cancel />;
    if (order.isDelivered) return <CheckCircle />;
    if (order.isPaid) return <LocalShipping />;
    return <ShoppingBag />;
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading orders...</Typography>
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

  if (orders.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <ShoppingBag sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          No Orders Yet
        </Typography>
        <Typography color="text.secondary" paragraph>
          You haven't placed any orders yet.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push("/products")}
        >
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "calc(100vh - 64px)",
      py: 6,
    }}>
      <Container sx={{ py: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/profile")}
          sx={{
            mb: 3,
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Back to Profile
        </Button>

        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          <ShoppingBag sx={{ fontSize: 40 }} />
          <Typography variant="h3" fontWeight={900}>
            📝 My Orders
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {orders.map((order, index) => (
            <Grid item xs={12} key={order._id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  background: "white",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                  "&:hover": {
                    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                  animation: `fadeIn 0.4s ease ${index * 0.1}s backwards`,
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="stretch">
                    <Grid item xs={12} sm={8}>
                      <Box display="flex" flexDirection="column" height="100%">
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Typography variant="h6" fontWeight="bold">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(order)}
                            label={getStatusText(order)}
                            color={getStatusColor(order)}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📅 Placed on: {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          💳 Payment: {order.paymentMethod.toUpperCase()}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box flexGrow={1}>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            Items:
                          </Typography>
                          {order.orderItems.slice(0, 2).map((item, idx) => (
                            <Typography key={idx} variant="body2" gutterBottom>
                              • {item.name} x {item.quantity}
                            </Typography>
                          ))}
                          {order.orderItems.length > 2 && (
                            <Typography variant="body2" color="text.secondary">
                              +{order.orderItems.length - 2} more items
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems={{ xs: "flex-start", sm: "flex-end" }}
                        height="100%"
                        justifyContent="space-between"
                        gap={2}
                      >
                        <Box
                          textAlign={{ xs: "left", sm: "right" }}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            width: "100%",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Amount
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            ${order.totalPrice.toFixed(2)}
                          </Typography>
                        </Box>

                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => router.push(`/orders/${order._id}`)}
                          fullWidth
                          sx={{
                            borderRadius: 2,
                            borderColor: "#667eea",
                            color: "#667eea",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: "#764ba2",
                              background: "rgba(102, 126, 234, 0.08)",
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
