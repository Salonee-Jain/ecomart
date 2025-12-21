"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    IconButton,
    Box,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Delete,
    ShoppingCart,
    FavoriteBorder,
} from "@mui/icons-material";
import { getToken, isAuthenticated } from "@/lib/auth";
import { getWishlist, removeFromWishlist, clearWishlist } from "@/services/wishlist.service";
import { addToCart } from "@/services/cart.service";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
}

interface Wishlist {
    _id: string;
    products: Product[];
}

export default function WishlistPage() {
    const router = useRouter();
    const [wishlist, setWishlist] = useState<Wishlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        fetchWishlist();
    }, [router]);

    const fetchWishlist = async () => {
        try {
            const data = await getWishlist();
            setWishlist(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId: string) => {
        setError("");
        try {
            await removeFromWishlist(productId);
            setSuccessMessage("Removed from wishlist!");
            fetchWishlist();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to remove item");
        }
    };

    const handleClearWishlist = async () => {
        if (!confirm("Are you sure you want to clear your entire wishlist?")) return;

        setError("");
        try {
            await clearWishlist();
            setSuccessMessage("Wishlist cleared!");
            fetchWishlist();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to clear wishlist");
        }
    };

    const handleAddToCart = async (productId: string) => {
        setError("");
        try {
            await addToCart({ productId, quantity: 1 });
            setSuccessMessage("Added to cart!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add to cart");
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading wishlist...</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 8 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h3" fontWeight={800}>
                    My Wishlist
                </Typography>
                {wishlist && wishlist.products.length > 0 && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClearWishlist}
                    >
                        Clear All
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
                    {successMessage}
                </Alert>
            )}

            {wishlist && wishlist.products.length > 0 ? (
                <Grid container spacing={3}>
                    {wishlist.products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.image}
                                    alt={product.name}
                                    sx={{ objectFit: "contain", p: 2, cursor: "pointer" }}
                                    onClick={() => router.push(`/products/${product._id}`)}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                        gutterBottom
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => router.push(`/products/${product._id}`)}
                                    >
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {product.category}
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color={product.stock > 0 ? "success.main" : "error.main"}>
                                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<ShoppingCart />}
                                        onClick={() => handleAddToCart(product._id)}
                                        disabled={product.stock === 0}
                                    >
                                        Add to Cart
                                    </Button>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveFromWishlist(product._id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Card>
                    <CardContent sx={{ py: 8, textAlign: "center" }}>
                        <FavoriteBorder sx={{ fontSize: 100, color: "text.secondary", mb: 3 }} />
                        <Typography variant="h5" gutterBottom>
                            Your wishlist is empty
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Start adding products you love to your wishlist!
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => router.push("/products")}
                        >
                            Browse Products
                        </Button>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
}
