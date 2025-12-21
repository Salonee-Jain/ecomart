"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  LocalShipping,
  Payment,
  CheckCircle,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { getToken, isAuthenticated } from "@/lib/auth";

interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
}

interface ShippingInfo {
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const steps = ["Shipping Information", "Payment", "Review & Place Order"];

export default function CheckoutPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "AUS",
  });

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

      if (data.items.length === 0) {
        router.push("/cart");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 0);
    }, 0);
  };

  const calculateTax = () => calculateSubtotal() * 0.1;
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping info
      const required = ["email", "address", "city", "state", "zipCode"];
      const missing = required.filter(field => !shippingInfo[field as keyof ShippingInfo]);

      if (missing.length > 0) {
        setError("Please fill in all required fields");
        return;
      }
    }

    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderItems: cartItems.map(item => ({
            name: item.name,
            product: item.product,
            quantity: item.quantity,
            price: item.price,
            sku: item.sku,
            image: item.image,
          })),
          shippingAddress: {
            address: shippingInfo.address,
            city: shippingInfo.city,
            postalCode: shippingInfo.zipCode,
            country: shippingInfo.country,
          },
          paymentMethod
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to place order");
      }

      const order = await response.json();

      // Clear cart after successful order
      await clearCart();

      // If payment method is card, redirect to Stripe checkout
      if (paymentMethod === "card") {
        await handleStripePayment(order);
      } else {
        // For COD or PayPal, just redirect to order confirmation
        router.push(`/orders/${order._id}`);
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleStripePayment = async (order: any) => {
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

      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const { clientSecret, stripePaymentIntentId } = await response.json();

      // Redirect to payment page with client secret
      router.push(`/payment?clientSecret=${clientSecret}&orderId=${order._id}`);
    } catch (err: any) {
      setError(`Order created but payment failed: ${err.message}`);
      setProcessing(false);
    }
  };

  const clearCart = async () => {
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
    } catch (err) {
      console.error("Failed to clear cart:", err);
      // Don't throw error - order was successful, cart clearing is secondary
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading checkout...</Typography>
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
          onClick={() => router.push("/cart")}
          sx={{
            mb: 3,
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Back to Cart
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
          <CheckCircle sx={{ fontSize: 40 }} />
          <Typography variant="h3" fontWeight={900}>
            🛍️ Checkout
          </Typography>
        </Box>

        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            bgcolor: "white",
            p: 3,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            "& .MuiStepLabel-root .Mui-completed": {
              color: "#667eea",
            },
            "& .MuiStepLabel-root .Mui-active": {
              color: "#667eea",
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
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
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <LocalShipping color="primary" />
                    <Typography variant="h5" fontWeight={700}>
                      Shipping Information
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="State/Province"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ZIP/Postal Code"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {activeStep === 1 && (
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
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
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <Payment color="primary" />
                    <Typography variant="h5" fontWeight={700}>
                      Payment Method
                    </Typography>
                  </Box>

                  <FormControl component="fieldset">
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label="Credit/Debit Card"
                      />
                      <FormControlLabel
                        value="paypal"
                        control={<Radio />}
                        label="PayPal"
                      />
                      <FormControlLabel
                        value="cod"
                        control={<Radio />}
                        label="Cash on Delivery"
                      />
                    </RadioGroup>
                  </FormControl>

                  <Alert severity="info" sx={{ mt: 3 }}>
                    Payment will be processed securely after order confirmation
                  </Alert>
                </CardContent>
              </Card>
            )}

            {activeStep === 2 && (
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
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
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <CheckCircle color="success" />
                    <Typography variant="h5" fontWeight={700}>
                      Review Your Order
                    </Typography>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                    {shippingInfo.country}<br />
                    Email: {shippingInfo.email}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Payment Method
                  </Typography>
                  <Typography variant="body2" paragraph textTransform="capitalize">
                    {paymentMethod.replace('cod', 'Cash on Delivery')}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  {cartItems.map((item) => (
                    <Box key={item.product} display="flex" justifyContent="space-between" mb={1}>
                      <Typography>
                        {item.name} x {item.quantity}
                      </Typography>
                      <Typography fontWeight="medium">
                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a4190 100%)",
                    },
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  variant="contained"
                  size="large"
                  disabled={processing}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
                    },
                  }}
                >
                  {processing ? "Processing..." : "🎉 Place Order"}
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={4}
              sx={{
                position: 'sticky',
                top: 80,
                borderRadius: 3,
                background: "white",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography variant="h5" fontWeight={700} mb={2}>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="medium">
                    ${calculateSubtotal().toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Shipping:</Typography>
                  <Chip label="FREE" size="small" color="success" />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Tax (10%):</Typography>
                  <Typography fontWeight="medium">
                    ${calculateTax().toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your order
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
