"use client";

import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  CircularProgress,
  Box,
  Alert,
  Button,
} from "@mui/material";
import useProducts from "@/hooks/useProducts";
import AddToCartButton from "@/components/AddToCartButton";
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
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading products...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">
          Failed to load products. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={800}>
          Featured Products
        </Typography>
        <Button component={Link} href="/products" variant="outlined">
          View All
        </Button>
      </Box>

      {products.length === 0 ? (
        <Alert severity="info">No products available at the moment.</Alert>
      ) : (
        <Grid container spacing={4}>
          {products.map((p: Product) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
                onClick={() => router.push(`/products/${p._id}`)}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={p.image}
                  alt={p.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {p.name}
                  </Typography>
                  <Typography
                    variant="h5"
                    color="primary"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    ${p.price.toFixed(2)}
                  </Typography>
                  <Box onClick={(e) => e.stopPropagation()}>
                    <AddToCartButton productId={p._id} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
