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
} from "@mui/material";
import { Search, Visibility } from "@mui/icons-material";
import { getAllOrders, markOrderDelivered } from "@/services/admin.service";
import { useRouter } from "next/navigation";

interface Order {
    _id: string;
    user: { name: string; email: string };
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    createdAt: string;
    items: any[];
}

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

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
            setSuccess("Order marked as delivered");
            fetchOrders();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update order");
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
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Order Management
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Manage and track all orders
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
                    {success}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box display="flex" gap={2} mb={3}>
                        <TextField
                            fullWidth
                            placeholder="Search by order ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">All Orders</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="paid">Processing</MenuItem>
                                <MenuItem value="delivered">Delivered</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <TableRow
                                            key={order._id}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => router.push(`/orders/${order._id}`)}
                                        >
                                            <TableCell>
                                                <Tooltip title="Click to copy Order ID">
                                                    <Typography
                                                        variant="body2"
                                                        fontFamily="monospace"
                                                        fontSize="0.75rem"
                                                        sx={{ cursor: 'pointer' }}
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
                                                <Typography>{order.user?.name || "Unknown"}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.user?.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell fontWeight={600}>${order.totalPrice.toFixed(2)}</TableCell>
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
                                                    onClick={(e) => {
                                                        if (!order.isDelivered && order.isPaid) {
                                                            handleMarkDelivered(order._id, e);
                                                        }
                                                    }}
                                                    sx={{
                                                        cursor: !order.isDelivered && order.isPaid ? "pointer" : "default",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/orders/${order._id}`);
                                                    }}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                {searchQuery || statusFilter ? "No orders found" : "No orders yet"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            Total: {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
