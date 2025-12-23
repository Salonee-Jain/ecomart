"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
    Grid,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { createProduct } from "@/services/admin.service";

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await createProduct({
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
            });
            router.push("/admin/products");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create product");
            setLoading(false);
        }
    };

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
                Create New Product
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Add a new product to your inventory
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
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                    >
                                        {loading ? "Creating..." : "Create Product"}
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
