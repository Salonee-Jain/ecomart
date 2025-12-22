"use client";

import {
  Grid,
  Typography,
  Container,
  CircularProgress,
  Box,
  Alert,
  Button,
} from "@mui/material";
import {
  Star,
  ShoppingBag,
  TrendingUp,
  LocalOffer,
} from "@mui/icons-material";
import useProducts from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { products, loading, error } = useProducts({ limit: 6 });

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }} variant="h6" color="text.secondary">
          Loading products...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
        >
          Failed to load products. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{
      background: "#FFFFFF",
      minHeight: "calc(100vh - 64px)",
    }}>
      <Container sx={{ py: 5 }}>
        {/* Hero Section */}
        <Box
          sx={{
            mb: 6,
            py: 8,
            px: 4,
            borderRadius: 3,
            background: "#FAFAFA",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            border: "1px solid #E8E8E8",
          }}
        >
          <Typography
            variant="h2"
            fontWeight={700}
            gutterBottom
            sx={{
              color: "#191919",
              letterSpacing: "-1px",
              mb: 2,
            }}
          >
            Everything you need, delivered
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#767676",
              mb: 4,
              fontWeight: 400,
              maxWidth: "650px",
              mx: "auto",
            }}
          >
            Browse our selection of premium products and get them delivered right to your door
          </Typography>
          <Button
            component={Link}
            href="/products"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#EB1700",
              color: "white",
              borderRadius: 3,
              px: 5,
              py: 1.8,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#C91400",
                boxShadow: "0 4px 12px rgba(235, 23, 0, 0.25)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Browse Menu
          </Button>
        </Box>

        {/* Products Section Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: "#191919",
              letterSpacing: "-0.5px",
            }}
          >
            Featured Items
          </Typography>
          <Button
            component={Link}
            href="/products"
            sx={{
              color: "#EB1700",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "15px",
              "&:hover": {
                backgroundColor: "#F8F9FA",
              },
            }}
          >
            View all →
          </Button>
        </Box>

        {products.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              bgcolor: "white",
              border: "1px solid #E8E8E8",
            }}
          >
            No products available at the moment.
          </Alert>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {products.map((p: Product, index: number) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={p._id}
              >
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
