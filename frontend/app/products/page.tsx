"use client";
import { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { ShoppingBag } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

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
    <Box sx={{
      background: "#FFFFFF",
      minHeight: "calc(100vh - 64px)",
      py: 4,
    }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
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
          <ShoppingBag sx={{ fontSize: 36, color: "#EB1700" }} />
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              color: "#191919",
              letterSpacing: "-0.5px",
            }}
          >
            All Products
          </Typography>
        </Box>

        {/* Filters */}
        <Card elevation={0} sx={{
          mb: 4,
          borderRadius: 2,
          background: "white",
          border: "1px solid #E8E8E8",
        }}>
          <CardContent sx={{ p: 3 }} >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search Products"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth
                  label="Max Price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
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
              <Grid item xs={6} sm={6} md={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    background: "#EB1700",
                    boxShadow: "none",
                    py: 1.8,
                    "&:hover": {
                      background: "#C91400",
                      boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                    },
                  }}
                >
                  Search
                </Button>
              </Grid>
              <Grid item xs={6} sm={6} md={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: "#E8E8E8",
                    color: "#191919",
                    py: 1.8,
                    "&:hover": {
                      borderColor: "#EB1700",
                      backgroundColor: "#FFF5F5",
                      color: "#EB1700",
                    },
                  }}
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
          {products.map((product, index) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={4}
              lg={4}
              key={product._id}
            >
              <ProductCard product={product} showDescription={true} />
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
    </Box>
  );
}
