"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      fetchProducts();
    }, 500); // Wait 500ms after user stops typing

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [page, keyword, category, minPrice, maxPrice]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products/categories");

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      // Use fallback categories if API fails
      setCategories(["Electronics", "Clothing", "Home", "Beauty"]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(keyword && { keyword }),
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      });

      const response = await fetch(`http://localhost:5000/api/products?${params}`);

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      console.log(data);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    fetchProducts();
  };

  const handleReset = () => {
    setKeyword("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading products...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        All Products
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Min Price"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Max Price"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={1.5}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={1.5}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleReset}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": { boxShadow: 6 }
              }}
              onClick={() => router.push(`/products/${product._id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {product.description}
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold" mb={2}>
                  ${product.price.toFixed(2)}
                </Typography>
                <Box onClick={(e) => e.stopPropagation()}>
                  <AddToCartButton
                    productId={product._id}
                    disabled={product.stock === 0}
                  />
                </Box>
                {product.stock === 0 && (
                  <Typography variant="caption" color="error" display="block" mt={1}>
                    Out of Stock
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary">
            No products found
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
