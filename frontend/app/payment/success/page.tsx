"use client";

import { useEffect, useState, Suspense } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { getToken } from "@/lib/auth";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.VERIFY_SESSION(sessionId),
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.orderId);
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Verifying payment...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Payment Successful!
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for your order. Your payment has been processed successfully.
          </Typography>

          {orderId && (
            <Typography variant="body2" color="text.secondary" paragraph>
              Order ID: {orderId}
            </Typography>
          )}

          <Box display="flex" gap={2} justifyContent="center" mt={4}>
            <Button
              variant="contained"
              onClick={() => router.push(orderId ? `/orders/${orderId}` : "/orders")}
            >
              View Order
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/")}
            >
              Continue Shopping
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
