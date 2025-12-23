"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
    Grid,
    CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { getProductById } from "@/services/product.service";
import { updateProduct } from "@/services/admin.service";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        price: "",
        stock: "",
        category: "",
        description: "",
        image: "",
        brand: "",
    });

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const res = await getProductById(params.id as string);
            const product = res.data;
            setFormData({
                name: product.name,
                sku: product.sku,
                price: product.price.toString(),
                stock: product.stock.toString(),
                category: product.category,
                description: product.description,
                image: product.image,
                brand: product.brand || "",
            });
        } catch (err: any) {
            setError("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            await updateProduct(params.id as string, {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
            });
            router.push("/admin/products");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update product");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.back()}
                sx={{ mb: 3 }}
            >
                Back
            </Button>

            <Typography variant="h4" fontWeight={700} gutterBottom>
                Edit Product
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Update product information
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Product Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="SKU"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Price"
                                    name="price"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Stock"
                                    name="stock"
                                    type="number"
                                    inputProps={{ min: "0" }}
                                    value={formData.stock}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Brand"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Description"
                                    name="description"
                                    multiline
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Image URL"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Box display="flex" gap={2} justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        onClick={() => router.back()}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
