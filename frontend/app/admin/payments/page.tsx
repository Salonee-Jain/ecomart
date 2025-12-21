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
    Grid,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    Search,
    TrendingUp,
    CheckCircle,
    HourglassEmpty,
    Check,
    Payment as PaymentIcon,
} from "@mui/icons-material";
import { getAllPayments, confirmPayment, markPaymentSucceeded } from "@/services/admin.service";

interface Payment {
    _id: string;
    orderId: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    order: {
        _id: string;
        totalPrice: number;
        isPaid: boolean;
        isDelivered: boolean;
        isCancelled: boolean;
        itemsCount: number;
    };
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [stats, setStats] = useState({
        totalRevenue: 0,
        successfulPayments: 0,
        pendingPayments: 0,
    });

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        let filtered = payments;

        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (payment) =>
                    payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    payment.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    payment.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter((payment) => payment.status === statusFilter);
        }

        setFilteredPayments(filtered);
    }, [searchQuery, statusFilter, payments]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await getAllPayments();

            const paymentsData = data.payments || [];
            setPayments(paymentsData);
            setFilteredPayments(paymentsData);

            // Calculate stats
            const totalRev = paymentsData
                .filter((p: Payment) => p.status === "succeeded")
                .reduce((sum: number, p: Payment) => sum + p.amount, 0);

            setStats({
                totalRevenue: totalRev,
                successfulPayments: paymentsData.filter((p: Payment) => p.status === "succeeded").length,
                pendingPayments: paymentsData.filter((p: Payment) => p.status === "pending").length,
            });

            setLoading(false);
        } catch (err: any) {
            setError("Failed to load payments");
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (orderId: string) => {
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/pay`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) throw new Error("Failed to mark order as paid");

            setSuccess("Order marked as paid successfully");
            fetchPayments();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to mark as paid");
        }
    };

    const handleConfirmPayment = async (paymentIntentId: string) => {
        setError("");
        setSuccess("");

        try {
            await confirmPayment(paymentIntentId);
            setSuccess("Payment confirmed successfully!");
            fetchPayments();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to confirm payment");
        }
    };

    const handleMarkPaymentSucceeded = async (paymentId: string) => {
        setError("");
        setSuccess("");

        try {
            await markPaymentSucceeded(paymentId);
            setSuccess("Payment marked as succeeded");
            fetchPayments();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to mark payment as succeeded");
        }
    };

    const handleCreateAndConfirmPayment = async (orderId: string, existingPaymentIntentId?: string) => {
        setError("");
        setSuccess("");

        try {
            let paymentIntentId = existingPaymentIntentId;

            // If no payment intent, create one first
            if (!paymentIntentId) {
                setSuccess("Creating payment intent...");
                const response = await fetch("http://localhost:5000/api/payment/create-intent", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ orderId }),
                });

                if (!response.ok) throw new Error("Failed to create payment intent");

                const data = await response.json();
                paymentIntentId = data.stripePaymentIntentId;
            }

            // Now confirm the payment
            if (!paymentIntentId) {
                throw new Error("Failed to get payment intent ID");
            }

            setSuccess("Confirming payment...");
            await confirmPayment(paymentIntentId);
            setSuccess("Payment confirmed successfully!");
            fetchPayments();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to process payment");
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
            title: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: <TrendingUp sx={{ fontSize: 40, color: "#4caf50" }} />,
            color: "#e8f5e9",
        },
        {
            title: "Successful Payments",
            value: stats.successfulPayments,
            icon: <CheckCircle sx={{ fontSize: 40, color: "#2196f3" }} />,
            color: "#e3f2fd",
        },
        {
            title: "Pending Payments",
            value: stats.pendingPayments,
            icon: <HourglassEmpty sx={{ fontSize: 40, color: "#ff9800" }} />,
            color: "#fff3e0",
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                💳 Payment Management
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
                    <Grid item xs={12} sm={6} md={4} key={index}>
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

            {/* Payments Table */}
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
                                <MenuItem value="">All Payments</MenuItem>
                                <MenuItem value="succeeded">✅ Successful</MenuItem>
                                <MenuItem value="pending">⏳ Pending</MenuItem>
                                <MenuItem value="failed">❌ Failed</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell><strong>Payment ID</strong></TableCell>
                                    <TableCell><strong>Order ID</strong></TableCell>
                                    <TableCell><strong>Payment Intent</strong></TableCell>
                                    <TableCell><strong>Customer</strong></TableCell>
                                    <TableCell><strong>Amount</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment._id} hover sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                                            <TableCell>
                                                <Tooltip title="Click to copy Payment ID">
                                                    <Typography
                                                        variant="body2"
                                                        fontFamily="monospace"
                                                        fontSize="0.75rem"
                                                        sx={{ cursor: "pointer", color: "#1976d2" }}
                                                        onClick={() => navigator.clipboard.writeText(payment._id)}
                                                    >
                                                        {payment._id}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Click to copy Order ID">
                                                    <Typography
                                                        variant="body2"
                                                        fontFamily="monospace"
                                                        fontSize="0.75rem"
                                                        sx={{ cursor: "pointer", color: "#1976d2" }}
                                                        onClick={() => navigator.clipboard.writeText(payment.orderId)}
                                                    >
                                                        {payment.orderId}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                {payment.paymentIntentId ? (
                                                    <Tooltip title="Click to copy Payment Intent ID">
                                                        <Typography
                                                            variant="body2"
                                                            fontFamily="monospace"
                                                            fontSize="0.75rem"
                                                            sx={{ cursor: "pointer", color: "#1976d2" }}
                                                            onClick={() => navigator.clipboard.writeText(payment.paymentIntentId)}
                                                        >
                                                            {payment.paymentIntentId}
                                                        </Typography>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {payment.user?.name || "Unknown"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {payment.user?.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} color="success.main">
                                                    ${payment.amount.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payment.status.toUpperCase()}
                                                    color={payment.status === "succeeded" ? "success" : payment.status === "pending" ? "warning" : "error"}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {payment.order.isDelivered ? (
                                                    <Chip label="✓ Delivered" size="small" color="success" />
                                                ) : payment.order.isPaid ? (
                                                    <Chip label="✓ Paid" size="small" color="info" />
                                                ) : (
                                                    <Tooltip title={payment.paymentIntentId ? "Confirm Payment via Stripe" : "Create & Confirm Payment"}>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleCreateAndConfirmPayment(payment.orderId, payment.paymentIntentId)}
                                                            sx={{
                                                                bgcolor: "#1976d2",
                                                                color: "white",
                                                                "&:hover": { bgcolor: "#1565c0" },
                                                            }}
                                                        >
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                            <PaymentIcon sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                {searchQuery || statusFilter ? "No payments found" : "No payments yet"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> payments
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            💡 Click on IDs to copy them
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
