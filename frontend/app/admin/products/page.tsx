"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Delete,
  Search,
  Edit,
  Add,
  Inventory,
  Category,
  AttachMoney,
  ShoppingBag,
} from "@mui/icons-material";
import { getProducts, getCategories } from "@/services/product.service";
import { deleteProduct } from "@/services/admin.service";


interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    categories: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.products);
      setFilteredProducts(data.products);

      // Calculate stats
      const totalValue = data.products.reduce((sum: number, p: Product) => sum + p.price * p.stock, 0);
      const lowStock = data.filter((p: Product) => p.stock < 10).length;
      const uniqueCategories = new Set(data.map((p: Product) => p.category)).size;

      setStats({
        totalProducts: data.length,
        totalValue,
        lowStock,
        categories: uniqueCategories,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      // Fallback to extracting categories from products if API fails
      setCategories([]);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteDialog.product) return;

    setError("");
    setSuccess("");

    try {
      await deleteProduct(deleteDialog.product._id);
      setSuccess(`✅ "${deleteDialog.product.name}" deleted successfully!`);
      setDeleteDialog({ open: false, product: null });
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete product");
      setDeleteDialog({ open: false, product: null });
    }
  };

  // Use fetched categories, fallback to unique categories from products if needed
  const displayCategories = categories.length > 0
    ? categories
    : [...new Set(products.map((p) => p.category))];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const statsCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <ShoppingBag sx={{ fontSize: 40, color: "#1976d2" }} />,
      color: "#e3f2fd",
    },
    {
      title: "Inventory Value",
      value: `$${stats.totalValue.toFixed(2)}`,
      icon: <AttachMoney sx={{ fontSize: 40, color: "#4caf50" }} />,
      color: "#e8f5e9",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: <Inventory sx={{ fontSize: 40, color: "#f44336" }} />,
      color: "#ffebee",
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: <Category sx={{ fontSize: 40, color: "#9c27b0" }} />,
      color: "#f3e5f5",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          🛍️ Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push("/admin/products/create")}
          sx={{
            bgcolor: "#1976d2",
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#1565c0" },
          }}
        >
          Add New Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                background: `linear-gradient(135deg, ${stat.color} 0%, white 100%)`,
                borderRadius: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Products Table */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          {/* Search and Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              fullWidth
              placeholder="🔍 Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {displayCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    📂 {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>Image</strong></TableCell>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell><strong>SKU</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell>
                  <TableCell><strong>Stock</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id} hover sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                      <TableCell>
                        <Avatar
                          src={product.image}
                          alt={product.name}
                          variant="rounded"
                          sx={{ width: 50, height: 50 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                          {product.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          ${product.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${product.stock} units`}
                          size="small"
                          color={product.stock < 10 ? "error" : "success"}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Tooltip title="Edit Product">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => router.push(`/admin/products/${product._id}`)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, product })}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <ShoppingBag sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {searchQuery || categoryFilter ? "No products found" : "No products yet"}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => router.push("/admin/products/create")}
                        sx={{ mt: 2 }}
                      >
                        Add Your First Product
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3}>
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>⚠️ Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>"{deleteDialog.product?.name}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, product: null })} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} variant="contained" color="error" startIcon={<Delete />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
