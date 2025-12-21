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
import {
  Star,
  ShoppingBag,
  TrendingUp,
  LocalOffer,
} from "@mui/icons-material";
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
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "calc(100vh - 64px)",
      py: 6,
    }}>
      <Container sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box
          sx={{
            mb: 5,
            p: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <Star sx={{ fontSize: 40, color: "#ffd700" }} />
          </Box>
          <Typography variant="h2" fontWeight={900} gutterBottom>
            ✨ Featured Collection
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, mb: 3 }}>
            Discover our handpicked selection of premium products
          </Typography>
          <Button
            component={Link}
            href="/products"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "white",
              color: "#667eea",
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1.1rem",
              "&:hover": {
                bgcolor: "#f0f0f0",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
            endIcon={<TrendingUp />}
          >
            Explore Full Catalog
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
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingBag sx={{ fontSize: 35, color: "#667eea" }} />
            <Typography variant="h4" fontWeight={800} color="#333">
              Best Sellers
            </Typography>
          </Box>
        </Box>

        {products.length === 0 ? (
          <Alert
            severity="info"
            sx={{ borderRadius: 3, bgcolor: "white" }}
          >
            No products available at the moment.
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {products.map((p: Product, index: number) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={p._id}
                sx={{
                  animation: `fadeIn 0.5s ease ${index * 0.1}s backwards`,
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Card
                  elevation={4}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "white",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    "&:hover": {
                      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                      transform: "translateY(-8px)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    },
                  }}
                  onClick={() => router.push(`/products/${p._id}`)}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="240"
                      image={p.image}
                      alt={p.name}
                      sx={{
                        objectFit: "cover",
                        transition: "transform 0.4s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: "#ff6b6b",
                        color: "white",
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <LocalOffer sx={{ fontSize: 16 }} />
                      <Typography variant="caption" fontWeight={700}>
                        HOT
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      noWrap
                      fontWeight={700}
                      sx={{ color: "#2d3748" }}
                    >
                      {p.name}
                    </Typography>
                    <Box sx={{ mt: "auto" }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={2}
                      >
                        <Typography
                          variant="h4"
                          fontWeight={900}
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          ${p.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box onClick={(e) => e.stopPropagation()}>
                        <AddToCartButton productId={p._id} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
