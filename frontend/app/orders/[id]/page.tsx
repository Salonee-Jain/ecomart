"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  LocalShipping,
  Payment,
  Cancel,
  Receipt,
} from "@mui/icons-material";
import { getToken, isAuthenticated } from "@/lib/auth";

interface OrderItem {
  product: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  paidAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    if (params.id) {
      fetchOrder();
    }
  }, [params.id, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Order not found");

      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;

    setProcessing(true);
    try {
      const response = await fetch("http://localhost:5000/api/payment/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderId: order._id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create payment");

      const { clientSecret } = await response.json();
      router.push(`/payment?clientSecret=${clientSecret}&orderId=${order._id}`);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm("Are you sure you want to cancel this order?")) return;

    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to cancel order");

      await fetchOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = () => {
    if (!order) return "default";
    if (order.isCancelled) return "error";
    if (order.isDelivered) return "success";
    if (order.isPaid) return "info";
    return "warning";
  };

  const getStatusText = () => {
    if (!order) return "";
    if (order.isCancelled) return "Cancelled";
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Processing";
    return "Pending Payment";
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading order...</Typography>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error || "Order not found"}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/orders")}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/orders")}
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            Order Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order ID: {order._id}
          </Typography>
        </Box>
        <Chip
          label={getStatusText()}
          color={getStatusColor()}
          size="large"
          icon={
            order.isCancelled ? <Cancel /> :
            order.isDelivered ? <CheckCircle /> :
            order.isPaid ? <LocalShipping /> : <Payment />
          }
        />
      </Box>

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Order Items
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.orderItems.map((item) => (
                      <TableRow key={item.product}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              component="img"
                              src={item.image}
                              alt={item.name}
                              sx={{ width: 50, height: 50, objectFit: "cover", borderRadius: 1 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SKU: {item.sku}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right" fontWeight="bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Shipping Address
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Items:</Typography>
                <Typography>${order.itemsPrice.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {order.shippingPrice === 0 ? "FREE" : `$${order.shippingPrice.toFixed(2)}`}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Tax:</Typography>
                <Typography>${order.taxPrice.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  ${order.totalPrice.toFixed(2)}
                </Typography>
              </Box>

              {!order.isPaid && !order.isCancelled && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePayNow}
                  disabled={processing}
                  startIcon={<Payment />}
                  sx={{ mb: 2 }}
                >
                  {processing ? "Processing..." : "Pay Now"}
                </Button>
              )}

              {!order.isDelivered && !order.isCancelled && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  size="large"
                  onClick={handleCancelOrder}
                  disabled={processing}
                  startIcon={<Cancel />}
                >
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment & Delivery Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Order Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" textTransform="capitalize">
                  {order.paymentMethod}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {order.paidAt && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Paid At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.paidAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {order.deliveredAt && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Delivered At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.deliveredAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {order.cancelledAt && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.cancelledAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
