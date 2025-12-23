"use client";

import { useState, useEffect } from "react";
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
    Chip,
    Alert,
    CircularProgress,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip,
    Grid,
    Button,
} from "@mui/material";
import {
    Search,
    Visibility,
    LocalShipping,
    CheckCircle,
    ShoppingCart,
    AttachMoney,
} from "@mui/icons-material";
import { getAllOrders, markOrderDelivered } from "@/services/admin.service";
import { useRouter } from "next/navigation";
import { useAdminData } from "@/contexts/AdminDataContext";

interface Order {
    _id: string;
    user: { name: string; email: string };
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    isCancelled?: boolean;
    createdAt: string;
    orderItems: any[];
}

export default function AdminOrdersPage() {
    const router = useRouter();
    const { refreshTrigger, triggerRefresh } = useAdminData();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingDelivery: 0,
        delivered: 0,
    });

    useEffect(() => {
        fetchOrders();
    }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

    useEffect(() => {
        let filtered = orders;

        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (order) =>
                    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter((order) => {
                if (statusFilter === "delivered") return order.isDelivered;
                if (statusFilter === "paid") return order.isPaid && !order.isDelivered;
                if (statusFilter === "pending") return !order.isPaid;
                return true;
            });
        }

        setFilteredOrders(filtered);
    }, [searchQuery, statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            setOrders(data);
            setFilteredOrders(data);

            // Calculate stats
            const totalRev = data.reduce((sum: number, order: Order) => sum + order.totalPrice, 0);
            const delivered = data.filter((o: Order) => o.isDelivered).length;
            const pendingDelivery = data.filter((o: Order) => o.isPaid && !o.isDelivered).length;

            setStats({
                totalOrders: data.length,
                totalRevenue: totalRev,
                pendingDelivery,
                delivered,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDelivered = async (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setError("");
        setSuccess("");

        try {
            await markOrderDelivered(orderId);
            setSuccess("✅ Order marked as delivered!");
            fetchOrders();
            triggerRefresh(); // Notify other admin pages
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to mark as delivered");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const statsCards = [
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: <ShoppingCart sx={{ fontSize: 40, color: "#1976d2" }} />,
            color: "#e3f2fd",
        },
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: <AttachMoney sx={{ fontSize: 40, color: "#4caf50" }} />,
            color: "#e8f5e9",
        },
        {
            title: "Pending Delivery",
            value: stats.pendingDelivery,
            icon: <LocalShipping sx={{ fontSize: 40, color: "#ff9800" }} />,
            color: "#fff3e0",
        },
        {
            title: "Delivered",
            value: stats.delivered,
            icon: <CheckCircle sx={{ fontSize: 40, color: "#9c27b0" }} />,
            color: "#f3e5f5",
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                📦 Order Management
            </Typography>

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
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
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

            {/* Orders Table */}
            <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                    {/* Search and Filters */}
                    <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                        <TextField
                            fullWidth
                            placeholder="🔍 Search by Order ID, customer name, or email..."
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
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">All Orders</MenuItem>
                                <MenuItem value="pending">⏳ Pending Payment</MenuItem>
                                <MenuItem value="paid">💳 Paid</MenuItem>
                                <MenuItem value="delivered">✅ Delivered</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: "auto" }}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell><strong>Order ID</strong></TableCell>
                                    <TableCell><strong>Customer</strong></TableCell>
                                    <TableCell><strong>Items</strong></TableCell>
                                    <TableCell><strong>Total</strong></TableCell>
                                    <TableCell><strong>Payment</strong></TableCell>
                                    <TableCell><strong>Delivery</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <TableRow
                                            key={order._id}
                                            hover
                                            sx={{
                                                cursor: "pointer",
                                                "&:hover": { bgcolor: "#fafafa" },
                                            }}
                                            onClick={() => router.push(`/orders/${order._id}`)}
                                        >
                                            <TableCell>
                                                <Tooltip title="Click to copy Order ID">
                                                    <Typography
                                                        variant="body2"
                                                        fontFamily="monospace"
                                                        fontSize="0.75rem"
                                                        sx={{ color: "#1976d2", cursor: "pointer" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(order._id);
                                                        }}
                                                    >
                                                        {order._id}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {order.user?.name || "Guest"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.user?.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {order.orderItems?.length || 0} items
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} color="success.main">
                                                    ${order.totalPrice.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.isPaid ? "✓ Paid" : "⏳ Pending"}
                                                    color={order.isPaid ? "success" : "warning"}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.isDelivered ? "✓ Delivered" : "📦 Pending"}
                                                    color={order.isDelivered ? "success" : "default"}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box display="flex" gap={1} justifyContent="flex-end">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/orders/${order._id}`);
                                                            }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {order.isPaid && !order.isDelivered && (
                                                        <Tooltip title="Mark as Delivered">
                                                            <IconButton
                                                                size="small"
                                                                color="success"
                                                                onClick={(e) => handleMarkDelivered(order._id, e)}
                                                                sx={{
                                                                    bgcolor: "#4caf50",
                                                                    color: "white",
                                                                    "&:hover": { bgcolor: "#45a049" },
                                                                }}
                                                            >
                                                                <LocalShipping fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                            <ShoppingCart sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                {searchQuery || statusFilter ? "No orders found" : "No orders yet"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            💡 Click on rows to view order details
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
