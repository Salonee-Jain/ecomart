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

  const getStatusStyle = (order: Order) => {
    if (order.isCancelled) return {
      bgcolor: "#FEE2E2",
      color: "#DC2626",
      border: "1px solid #FCA5A5"
    };
    if (order.isDelivered) return {
      bgcolor: "#D1FAE5",
      color: "#059669",
      border: "1px solid #6EE7B7"
    };
    if (order.isPaid) return {
      bgcolor: "#DBEAFE",
      color: "#2563EB",
      border: "1px solid #93C5FD"
    };
    return {
      bgcolor: "#FEF3C7",
      color: "#D97706",
      border: "1px solid #FCD34D"
    };
  };

  const getStatusText = (order: Order) => {
    if (order.isCancelled) return "Cancelled";
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Processing";
    return "Pending Payment";
  };

  const getStatusIcon = (order: Order) => {
    if (order.isCancelled) return <Cancel sx={{ fontSize: 18 }} />;
    if (order.isDelivered) return <CheckCircle sx={{ fontSize: 18 }} />;
    if (order.isPaid) return <LocalShipping sx={{ fontSize: 18 }} />;
    return <ShoppingBag sx={{ fontSize: 18 }} />;
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
      <Box sx={{ background: "#FFFFFF", minHeight: "calc(100vh - 64px)", py: 8 }}>
        <Container sx={{ textAlign: "center" }}>
          <ShoppingBag sx={{ fontSize: 80, color: "#767676", mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: "#191919", fontWeight: 700 }}>
            No Orders Yet
          </Typography>
          <Typography color="text.secondary" paragraph>
            You haven't placed any orders yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/products")}
            sx={{
              background: "#EB1700",
              boxShadow: "none",
              textTransform: "none",
              "&:hover": {
                background: "#C91400",
                boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
              },
            }}
          >
            Start Shopping
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      background: "#FFFFFF",
      minHeight: "calc(100vh - 64px)",
      py: 4,
    }}>
      <Container sx={{ py: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/profile")}
          sx={{
            mb: 3,
            fontWeight: 600,
            borderRadius: 2,
            color: "#191919",
            "&:hover": {
              backgroundColor: "#F8F9FA",
              color: "#EB1700",
            },
          }}
        >
          Back to Profile
        </Button>

        <Box
          sx={{
            mb: 4,
            py: 3,
            px: 4,
            borderRadius: 2,
            background: "#FAFAFA",
            border: "1px solid #E8E8E8",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <ShoppingBag sx={{ fontSize: 36, color: "#EB1700" }} />
          <Typography variant="h3" fontWeight={700} sx={{ color: "#191919", letterSpacing: "-0.5px" }}>
            My Orders
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {orders.map((order, index) => (
            <Grid size={{xs: 12}} key={order._id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  background: "white",
                  border: "1px solid #E8E8E8",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                    borderColor: "#D0D0D0",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="stretch">
                    <Grid size={{xs: 12, sm: 8}}>
                      <Box display="flex" flexDirection="column" height="100%">
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Typography variant="h6" fontWeight="bold">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(order)}
                            label={getStatusText(order)}
                            size="small"
                            sx={{
                              ...getStatusStyle(order),
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
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

                    <Grid size={{xs: 12, sm: 4}}>
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
                            width: "100%",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Amount
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{
                              color: "#EB1700",
                             
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
                            height: "40%",
                            borderRadius: 2,
                            borderColor: "#E8E8E8",
                            color: "#EB1700",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "#EB1700",
                              background: "#FFF5F5",
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
