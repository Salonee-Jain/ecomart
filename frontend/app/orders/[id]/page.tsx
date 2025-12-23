"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
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
    if (!params.id) return;
    const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
    try {
      const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(orderId), {
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
      const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
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
      const response = await fetch(API_ENDPOINTS.CANCEL_ORDER(order._id), {
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

  const getStatusStyle = () => {
    if (!order) return {};
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
    <Box sx={{
      background: "#FFFFFF",
      minHeight: "calc(100vh - 64px)",
      py: 4,
    }}>
      <Container sx={{ py: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/orders")}
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
          Back to Orders
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
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Receipt sx={{ fontSize: 36, color: "#EB1700" }} />
              <Typography variant="h3" fontWeight={700} sx={{ color: "#191919", letterSpacing: "-0.5px" }}>
                Order Details
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ color: "#767676" }}>
              Order ID: #{order._id.slice(-8).toUpperCase()}
            </Typography>
          </Box>
          <Chip
            label={getStatusText()}
            size="medium"
            icon={
              order.isCancelled ? <Cancel sx={{ fontSize: 20 }} /> :
                order.isDelivered ? <CheckCircle sx={{ fontSize: 20 }} /> :
                  order.isPaid ? <LocalShipping sx={{ fontSize: 20 }} /> : <Payment sx={{ fontSize: 20 }} />
            }
            sx={{
              ...getStatusStyle(),
              fontWeight: 600,
              px: 2,
              py: 2.5,
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Order Items */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid #E8E8E8",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: "#191919" }}>
                  Order Items
                </Typography>
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#FAFAFA" }}>
                        <TableCell sx={{ fontWeight: 600, color: "#191919" }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: "#191919" }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#191919" }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#191919" }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.orderItems.map((item) => (
                        <TableRow key={item.product} sx={{ "&:hover": { backgroundColor: "#FAFAFA" } }}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box
                                component="img"
                                src={item.image}
                                alt={item.name}
                                sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1, border: "1px solid #E8E8E8" }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={600} sx={{ color: "#191919" }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ color: "#767676" }}>
                                  SKU: {item.sku}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>{item.quantity}</TableCell>
                          <TableCell align="right" sx={{ color: "#EB1700", fontWeight: 600 }}>${item.price.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ color: "#EB1700", fontWeight: 700, fontSize: "1.1rem" }}>
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
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #E8E8E8",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: "#191919" }}>
                  Shipping Address
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "#FAFAFA", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid #E8E8E8",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: "#191919" }}>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography sx={{ color: "#767676" }}>Items:</Typography>
                  <Typography fontWeight={600}>${order.itemsPrice.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography sx={{ color: "#767676" }}>Shipping:</Typography>
                  <Typography fontWeight={600}>
                    {order.shippingPrice === 0 ? (
                      <Chip label="FREE" size="small" sx={{ bgcolor: "#10B981", color: "white", fontWeight: 600 }} />
                    ) : (
                      `$${order.shippingPrice.toFixed(2)}`
                    )}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography sx={{ color: "#767676" }}>Tax:</Typography>
                  <Typography fontWeight={600}>${order.taxPrice.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={3} sx={{ p: 2, backgroundColor: "#FFF5F5", borderRadius: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Total:
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: "#EB1700" }}>
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
                    sx={{
                      mb: 2,
                      py: 1.5,
                      background: "#EB1700",
                      boxShadow: "none",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      "&:hover": {
                        background: "#C91400",
                        boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                      },
                    }}
                  >
                    {processing ? "Processing..." : "Pay Now"}
                  </Button>
                )}

                {!order.isDelivered && !order.isCancelled && (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={handleCancelOrder}
                    disabled={processing}
                    startIcon={<Cancel />}
                    sx={{
                      borderColor: "#E8E8E8",
                      color: "#EB1700",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 2,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#EB1700",
                        backgroundColor: "#FFF5F5",
                      },
                    }}
                  >
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment & Delivery Info */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #E8E8E8",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: "#191919" }}>
                  Order Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: "#767676", mb: 0.5 }}>
                    Payment Method
                  </Typography>
                  <Typography variant="body1" textTransform="capitalize" fontWeight={600}>
                    {order.paymentMethod}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: "#767676", mb: 0.5 }}>
                    Order Date
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                {order.paidAt && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: "#767676", mb: 0.5 }}>
                      Paid At
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: "#10B981" }}>
                      {new Date(order.paidAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {order.deliveredAt && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: "#767676", mb: 0.5 }}>
                      Delivered At
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: "#10B981" }}>
                      {new Date(order.deliveredAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {order.cancelledAt && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ color: "#767676", mb: 0.5 }}>
                      Cancelled At
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: "#EB1700" }}>
                      {new Date(order.cancelledAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
