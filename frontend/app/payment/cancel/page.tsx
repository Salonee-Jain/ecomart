"use client";

import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { Cancel } from "@mui/icons-material";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Cancel sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Payment Cancelled
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Your payment was cancelled. No charges were made to your account.
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Your order is still pending. You can complete the payment later from your orders page.
          </Typography>

          <Box display="flex" gap={2} justifyContent="center" mt={4}>
            <Button
              variant="contained"
              onClick={() => router.push("/cart")}
            >
              Back to Cart
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
