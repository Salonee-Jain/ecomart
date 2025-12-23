"use client";

import { Suspense } from "react";
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

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

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
