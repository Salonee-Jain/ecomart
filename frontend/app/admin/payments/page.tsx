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
    Cancel,
    HourglassEmpty,
    Check,
    Close,
} from "@mui/icons-material";
import { getAllPayments, confirmPayment, markPaymentSucceeded } from "@/services/admin.service";

interface Payment {
    _id: string;
    orderId: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
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
        paymentMethod: string;
        itemsCount: number;
    };
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
    metadata?: any;
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
        failedPayments: 0,
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
            // Get all payments from dedicated endpoint
            const data = await getAllPayments();
            const paymentsData = data.payments || [];

            setPayments(paymentsData);
            setFilteredPayments(paymentsData);

            // Calculate stats
            const successful = paymentsData.filter((p: any) => p.status === "succeeded");
            const totalRevenue = successful.reduce(
                (sum: number, p: any) => sum + p.amount,
                0
            );

            setStats({
                totalRevenue,
                successfulPayments: successful.length,
                pendingPayments: paymentsData.filter((p: any) => p.status === "pending").length,
                failedPayments: 0,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (orderId: string) => {
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/orders/${orderId}/pay`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to update payment");

            setSuccess("Payment marked as paid");
            fetchPayments();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to update payment");
        }
    };

    const handleConfirmPayment = async (paymentIntentId: string) => {
        setError("");
        setSuccess("");

        try {
            await confirmPayment(paymentIntentId);
            setSuccess("Payment confirmed successfully");
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
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: <TrendingUp sx={{ fontSize: 30 }} />,
            color: "#4caf50",
            bgColor: "#e8f5e9",
        },
        {
            title: "Successful Payments",
            value: stats.successfulPayments,
            icon: <CheckCircle sx={{ fontSize: 30 }} />,
            color: "#2196f3",
            bgColor: "#e3f2fd",
        },
        {
            title: "Pending Payments",
            value: stats.pendingPayments,
            icon: <HourglassEmpty sx={{ fontSize: 30 }} />,
            color: "#ff9800",
            bgColor: "#fff3e0",
        },
        {
            title: "Failed Payments",
            value: stats.failedPayments,
            icon: <Cancel sx={{ fontSize: 30 }} />,
            color: "#f44336",
            bgColor: "#ffebee",
        },
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Payment Management
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                View and manage all payment transactions
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
                                        <Typography variant="h5" fontWeight={700}>
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
                                <MenuItem value="">All Payments</MenuItem>
                                <MenuItem value="succeeded">Successful</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="failed">Failed</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Payment ID</TableCell>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Payment Intent</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment._id} hover>
                                            <TableCell>
                                                <Tooltip title="Click to copy Payment ID">
                                                    <Typography
                                                        variant="body2"
                                                        fontFamily="monospace"
                                                        fontSize="0.75rem"
                                                        sx={{ cursor: 'pointer' }}
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
                                                        sx={{ cursor: 'pointer' }}
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
                                                            sx={{ cursor: 'pointer' }}
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
                                                <Typography>{payment.user?.name || "Unknown"}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {payment.user?.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600}>
                                                    ${payment.amount.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={(payment.paymentMethod || 'stripe').toUpperCase()}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payment.status}
                                                    color={payment.status === "succeeded" ? "success" : "warning"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {payment.order.isPaid ? (
                                                    <Chip
                                                        label={payment.order.isDelivered ? "Delivered" : "Paid"}
                                                        size="small"
                                                        color={payment.order.isDelivered ? "success" : "info"}
                                                    />
                                                ) : (
                                                    <Box display="flex" gap={1}>
                                                        <Tooltip title="Mark as Paid (Order Only)">
                                                            <IconButton
                                                                size="small"
                                                                color="success"
                                                                onClick={() => handleMarkAsPaid(payment.orderId)}
                                                            >
                                                                <Check />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {payment.status !== "succeeded" && (
                                                            <Tooltip title={payment.paymentIntentId ? "Confirm Payment (Stripe)" : "Create & Confirm Payment"}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleCreateAndConfirmPayment(payment.orderId, payment.paymentIntentId)}
                                                                >
                                                                    <CheckCircle />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                {searchQuery || statusFilter
                                                    ? "No payments found"
                                                    : "No payments yet"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            Total: {filteredPayments.length} payment
                            {filteredPayments.length !== 1 ? "s" : ""}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
