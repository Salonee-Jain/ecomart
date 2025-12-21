"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
} from "@mui/material";
import {
    TrendingUp,
    ShoppingBag,
    Inventory,
    People,
} from "@mui/icons-material";
import { getAnalytics, getAllOrders } from "@/services/admin.service";

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
}

interface Order {
    _id: string;
    user: { name: string };
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState<Stats>({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [analytics, orders] = await Promise.all([
                getAnalytics(),
                getAllOrders(),
            ]);

            setStats({
                totalRevenue: analytics.orders.totalRevenue || 0,
                totalOrders: analytics.orders.totalOrders || 0,
                totalProducts: analytics.products.totalProducts || 0,
                totalUsers: analytics.users.length || 0,
            });

            // Get last 5 orders
            setRecentOrders(orders.slice(0, 5));
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: <TrendingUp sx={{ fontSize: 40 }} />,
            color: "#4caf50",
            bgColor: "#e8f5e9",
        },
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: <ShoppingBag sx={{ fontSize: 40 }} />,
            color: "#2196f3",
            bgColor: "#e3f2fd",
        },
        {
            title: "Total Products",
            value: stats.totalProducts,
            icon: <Inventory sx={{ fontSize: 40 }} />,
            color: "#ff9800",
            bgColor: "#fff3e0",
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: <People sx={{ fontSize: 40 }} />,
            color: "#9c27b0",
            bgColor: "#f3e5f5",
        },
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Welcome to your admin dashboard
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="start">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {card.value}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: card.bgColor,
                                            color: card.color,
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Recent Orders */}
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Recent Orders
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => router.push("/admin/orders")}
                        >
                            View All
                        </Button>
                    </Box>

                    {recentOrders.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow
                                            key={order._id}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => router.push(`/admin/orders/${order._id}`)}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{order.user?.name || "Unknown"}</TableCell>
                                            <TableCell fontWeight={600}>
                                                ${order.totalPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        order.isDelivered
                                                            ? "Delivered"
                                                            : order.isPaid
                                                                ? "Processing"
                                                                : "Pending"
                                                    }
                                                    color={
                                                        order.isDelivered
                                                            ? "success"
                                                            : order.isPaid
                                                                ? "info"
                                                                : "warning"
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box py={4} textAlign="center">
                            <Typography color="text.secondary">No orders yet</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
