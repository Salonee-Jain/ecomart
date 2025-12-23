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
import { isAuthenticated } from "@/lib/auth";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

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
    const { 
        wishlistItems, 
        loading, 
        error: wishlistError,
        removeFromWishlist, 
        clearWishlist 
    } = useWishlist();
    const { addToCart: addToCartContext } = useCart();
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
    }, [router]);

    const handleRemoveFromWishlist = async (productId: string) => {
        setError("");
        try {
            await removeFromWishlist(productId);
            setSuccessMessage("Removed from wishlist!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError("Failed to remove item");
        }
    };

    const handleClearWishlist = async () => {
        if (!confirm("Are you sure you want to clear your entire wishlist?")) return;

        setError("");
        try {
            await clearWishlist();
            setSuccessMessage("Wishlist cleared!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError("Failed to clear wishlist");
        }
    };

    const handleAddToCart = async (product: Product) => {
        setError("");
        try {
            await addToCartContext(product._id, 1, {
                name: product.name,
                image: product.image,
                price: product.price,
                stock: product.stock,
                sku: product._id, // Using _id as sku fallback
            });
            setSuccessMessage("Added to cart!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError("Failed to add to cart");
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
        <Box sx={{
            background: "#FFFFFF",
            minHeight: "calc(100vh - 64px)",
            py: 4,
        }}>
            <Container sx={{ py: 2 }}>
                <Box
                    sx={{
                        mb: 4,
                        py: 3,
                        px: 4,
                        borderRadius: 2,
                        background: "#FAFAFA",
                        border: "1px solid #E8E8E8",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <FavoriteBorder sx={{ fontSize: 36, color: "#EB1700" }} />
                        <Typography variant="h3" fontWeight={700} sx={{ color: "#191919", letterSpacing: "-0.5px" }}>
                            My Wishlist
                        </Typography>
                    </Box>
                    {wishlistItems.length > 0 && (
                        <Button
                            variant="outlined"
                            onClick={handleClearWishlist}
                            sx={{
                                borderColor: "#E8E8E8",
                                color: "#EB1700",
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: 2,
                                "&:hover": {
                                    borderColor: "#EB1700",
                                    backgroundColor: "#FFF5F5",
                                },
                            }}
                        >
                            Clear All
                        </Button>
                    )}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage("")}>
                        {successMessage}
                    </Alert>
                )}

                {wishlistItems.length > 0 ? (
                    <Grid container spacing={3}>
                        {wishlistItems.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: 2,
                                        border: "1px solid #E8E8E8",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                            transform: "translateY(-4px)",
                                            borderColor: "#D0D0D0",
                                        },
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={product.image}
                                        alt={product.name}
                                        sx={{ objectFit: "cover", cursor: "pointer" }}
                                        onClick={() => router.push(`/products/${product._id}`)}
                                    />
                                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
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
                                                color: "#191919",
                                                fontSize: "1rem",
                                            }}
                                            onClick={() => router.push(`/products/${product._id}`)}
                                        >
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ color: "#767676" }}>
                                            {product.category}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: "#EB1700", mb: 1 }}>
                                            ${product.price ? product.price.toFixed(2) : '0.00'}
                                        </Typography>
                                        <Typography variant="body2" color={product.stock > 0 ? "success.main" : "error.main"}>
                                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ p: 2.5, pt: 0 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<ShoppingCart />}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock === 0}
                                            sx={{
                                                background: "#EB1700",
                                                boxShadow: "none",
                                                textTransform: "none",
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                "&:hover": {
                                                    background: "#C91400",
                                                    boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                                                },
                                                "&:disabled": {
                                                    background: "#E0E0E0",
                                                },
                                            }}
                                        >
                                            Add to Cart
                                        </Button>
                                        <IconButton
                                            onClick={() => handleRemoveFromWishlist(product._id)}
                                            sx={{
                                                color: "#EB1700",
                                                "&:hover": {
                                                    backgroundColor: "#FFF5F5",
                                                },
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ background: "#FAFAFA", borderRadius: 2, border: "1px solid #E8E8E8", py: 8, textAlign: "center" }}>
                        <FavoriteBorder sx={{ fontSize: 100, color: "#767676", mb: 3 }} />
                        <Typography variant="h5" gutterBottom sx={{ color: "#191919", fontWeight: 700 }}>
                            Your wishlist is empty
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Start adding products you love to your wishlist!
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => router.push("/products")}
                            sx={{
                                background: "#EB1700",
                                boxShadow: "none",
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 4,
                                "&:hover": {
                                    background: "#C91400",
                                    boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                                },
                            }}
                        >
                            Browse Products
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
