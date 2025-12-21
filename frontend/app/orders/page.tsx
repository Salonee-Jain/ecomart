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
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        My Orders
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card
              sx={{
                "&:hover": { boxShadow: 6 },
                transition: "all 0.3s ease",
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
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
                      Placed on: {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment: {order.paymentMethod.toUpperCase()}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box>
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
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems={{ xs: "flex-start", sm: "flex-end" }}
                      height="100%"
                      justifyContent="space-between"
                    >
                      <Box textAlign={{ xs: "left", sm: "right" }} mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          ${order.totalPrice.toFixed(2)}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => router.push(`/orders/${order._id}`)}
                        fullWidth
                        sx={{ maxWidth: { sm: 200 } }}
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
  );
}
