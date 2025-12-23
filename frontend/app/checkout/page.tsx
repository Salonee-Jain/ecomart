"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
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
import { validateEmail, validateRequired, validateZipCode } from "@/lib/validation";
import { calculatePricing, validateDiscountCode, formatPrice } from "@/lib/pricing";
import { useCart } from "@/contexts/CartContext";

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
  const { clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");

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
      const response = await fetch(API_ENDPOINTS.CART, {
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

  const pricing = calculatePricing(
    cartItems.map(item => ({ price: item.price, quantity: item.quantity })),
    shippingInfo.country,
    appliedDiscount
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value,
    });

    // Real-time validation
    let error = "";
    if (name === "email") {
      const validation = validateEmail(value);
      error = validation.error || "";
    } else if (name === "zipCode") {
      const validation = validateZipCode(value, shippingInfo.country);
      error = validation.error || "";
    } else {
      const validation = validateRequired(value, name.charAt(0).toUpperCase() + name.slice(1));
      error = validation.error || "";
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleApplyDiscount = () => {
    const validation = validateDiscountCode(discountCode);
    setDiscountMessage(validation.message);

    if (validation.valid) {
      setAppliedDiscount(discountCode.toUpperCase());
    } else {
      setAppliedDiscount("");
    }

    // Clear message after 3 seconds
    setTimeout(() => setDiscountMessage(""), 3000);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate all shipping fields
      const errors: Record<string, string> = {};

      const emailValidation = validateEmail(shippingInfo.email);
      if (!emailValidation.isValid) errors.email = emailValidation.error || "";

      const addressValidation = validateRequired(shippingInfo.address, "Address");
      if (!addressValidation.isValid) errors.address = addressValidation.error || "";

      const cityValidation = validateRequired(shippingInfo.city, "City");
      if (!cityValidation.isValid) errors.city = cityValidation.error || "";

      const stateValidation = validateRequired(shippingInfo.state, "State");
      if (!stateValidation.isValid) errors.state = stateValidation.error || "";

      const zipValidation = validateZipCode(shippingInfo.zipCode, shippingInfo.country);
      if (!zipValidation.isValid) errors.zipCode = zipValidation.error || "";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError("Please correct the errors in the form");
        return;
      }
    }

    setError("");
    setFieldErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.ORDERS, {
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

      // Clear cart after successful order using CartContext
      try {
        await clearCart();
      } catch (err) {
        console.error("Failed to clear cart:", err);
        // Don't fail the order if cart clearing fails
      }

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
      background: "#FFFFFF",
      minHeight: "calc(100vh - 64px)",
      py: 4,
    }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/cart")}
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
          Back to Cart
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
          <CheckCircle sx={{ fontSize: 36, color: "#EB1700" }} />
          <Typography variant="h3" fontWeight={700} sx={{ color: "#191919", letterSpacing: "-0.5px" }}>
            Checkout
          </Typography>
        </Box>

        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            border: "1px solid #E8E8E8",
            "& .MuiStepLabel-root .Mui-completed": {
              color: "#EB1700",
            },
            "& .MuiStepLabel-root .Mui-active": {
              color: "#EB1700",
            },
            "& .MuiStepIcon-root.Mui-completed": {
              color: "#EB1700",
            },
            "& .MuiStepIcon-root.Mui-active": {
              color: "#EB1700",
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
          <Grid size={{ xs: 12, md: 8 }}>
            {activeStep === 0 && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #E8E8E8",
                  background: "white",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <LocalShipping sx={{ color: "#EB1700", fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ color: "#191919" }}>
                      Shipping Information
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email}
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
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                        error={!!fieldErrors.address}
                        helperText={fieldErrors.address}
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        required
                        error={!!fieldErrors.city}
                        helperText={fieldErrors.city}
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="State/Province"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        required
                        error={!!fieldErrors.state}
                        helperText={fieldErrors.state}
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="ZIP/Postal Code"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        required
                        error={!!fieldErrors.zipCode}
                        helperText={fieldErrors.zipCode}
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        required
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
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {activeStep === 1 && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #E8E8E8",
                  background: "white",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <Payment sx={{ color: "#EB1700", fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ color: "#191919" }}>
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
                        control={<Radio sx={{ color: "#EB1700", "&.Mui-checked": { color: "#EB1700" } }} />}
                        label="Credit/Debit Card"
                      />
                      <FormControlLabel
                        value="paypal"
                        control={<Radio sx={{ color: "#EB1700", "&.Mui-checked": { color: "#EB1700" } }} />}
                        label="PayPal"
                      />
                      <FormControlLabel
                        value="cod"
                        control={<Radio sx={{ color: "#EB1700", "&.Mui-checked": { color: "#EB1700" } }} />}
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
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #E8E8E8",
                  background: "white",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <CheckCircle sx={{ color: "#10B981", fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ color: "#191919" }}>
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
                    fontWeight: 600,
                    textTransform: "none",
                    background: "#EB1700",
                    boxShadow: "none",
                    "&:hover": {
                      background: "#C91400",
                      boxShadow: "0 4px 12px rgba(235, 23, 0, 0.3)",
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
                    fontWeight: 600,
                    textTransform: "none",
                    background: "#EB1700",
                    boxShadow: "none",
                    "&:hover": {
                      background: "#C91400",
                      boxShadow: "0 4px 12px rgba(235, 23, 0, 0.3)",
                    },
                    "&:disabled": {
                      background: "#E8E8E8",
                      color: "#767676",
                    },
                  }}
                >
                  {processing ? "Processing..." : "Place Order"}
                </Button>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                position: 'sticky',
                top: 80,
                borderRadius: 2,
                background: "white",
                border: "1px solid #E8E8E8",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={700} mb={2} sx={{ color: "#191919" }}>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Discount Code Input */}
                <Box mb={3}>
                  <Typography variant="body2" fontWeight={600} mb={1}>
                    Discount Code
                  </Typography>
                  <Box display="flex" gap={1}>
                    <TextField
                      size="small"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      disabled={!!appliedDiscount}
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&:hover fieldset": {
                            borderColor: "#EB1700",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#EB1700",
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleApplyDiscount}
                      disabled={!discountCode || !!appliedDiscount}
                      sx={{
                        bgcolor: "#EB1700",
                        "&:hover": { bgcolor: "#C91400" },
                        textTransform: "none",
                        px: 2,
                      }}
                    >
                      {appliedDiscount ? "Applied" : "Apply"}
                    </Button>
                  </Box>
                  {discountMessage && (
                    <Alert
                      severity={appliedDiscount ? "success" : "error"}
                      sx={{ mt: 1, py: 0.5 }}
                    >
                      {discountMessage}
                    </Alert>
                  )}
                  {appliedDiscount && (
                    <Chip
                      label={appliedDiscount}
                      onDelete={() => {
                        setAppliedDiscount("");
                        setDiscountCode("");
                      }}
                      size="small"
                      sx={{ mt: 1, bgcolor: "#FFF5F5", color: "#EB1700" }}
                    />
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="medium">
                    ${pricing.subtotal.toFixed(2)}
                  </Typography>
                </Box>
                {pricing.discount > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="success.main">Discount:</Typography>
                    <Typography fontWeight="medium" color="success.main">
                      -${pricing.discount.toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Shipping:</Typography>
                  {pricing.shipping === 0 ? (
                    <Chip label="FREE" size="small" color="success" />
                  ) : (
                    <Typography fontWeight="medium">
                      ${pricing.shipping.toFixed(2)}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Tax (10%):</Typography>
                  <Typography fontWeight="medium">
                    ${pricing.tax.toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#191919" }}>
                    Total:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: "#EB1700" }}>
                    ${pricing.total.toFixed(2)}
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
