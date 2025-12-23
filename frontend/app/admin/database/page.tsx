"use client";

import { useState } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
} from "@mui/material";
import {
    Delete,
    Refresh,
    Storage,
    Warning,
    CheckCircle,
    DataObject,
} from "@mui/icons-material";
import { getToken } from "@/lib/auth";

interface DatabaseStats {
    collections: {
        users: {
            total: number;
            admin: number;
            regular: number;
        };
        products: number;
        orders: number;
        carts: number;
        payments: number;
    };
    totalDocuments: number;
}

export default function DatabaseManagementPage() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: string;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        open: false,
        action: "",
        title: "",
        message: "",
        onConfirm: () => { },
    });

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.DATABASE_STATS, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch stats");

            const data = await response.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefactorDatabase = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(API_ENDPOINTS.DATABASE_REFACTOR, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) throw new Error("Failed to refactor database");

            const data = await response.json();
            setSuccess(data.message);
            await fetchStats();
            setTimeout(() => setSuccess(""), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setConfirmDialog({ ...confirmDialog, open: false });
        }
    };

    const handleClearAll = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(API_ENDPOINTS.DATABASE_CLEAR, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) throw new Error("Failed to clear database");

            const data = await response.json();
            setSuccess(data.message);
            await fetchStats();
            setTimeout(() => setSuccess(""), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setConfirmDialog({ ...confirmDialog, open: false });
        }
    };

    const handleSeedData = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(API_ENDPOINTS.DATABASE_SEED, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) throw new Error("Failed to seed database");

            const data = await response.json();
            setSuccess(data.message);
            await fetchStats();
            setTimeout(() => setSuccess(""), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setConfirmDialog({ ...confirmDialog, open: false });
        }
    };

    const openConfirmDialog = (
        action: string,
        title: string,
        message: string,
        onConfirm: () => void
    ) => {
        setConfirmDialog({
            open: true,
            action,
            title,
            message,
            onConfirm,
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                🗄️ Database Management
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

            {/* Stats Card */}
            <Card elevation={3} sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight={600}>
                            Database Statistics
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchStats}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Box>

                    {stats ? (
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: "#e3f2fd", p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Users
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.collections.users.total}
                                    </Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        <Chip label={`${stats.collections.users.admin} Admin`} size="small" color="primary" />
                                        <Chip label={`${stats.collections.users.regular} Regular`} size="small" />
                                    </Box>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: "#fff3e0", p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Products
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.collections.products}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: "#e8f5e9", p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Orders
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.collections.orders}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: "#f3e5f5", p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Carts
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.collections.carts}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: "#fce4ec", p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Payments
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.collections.payments}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ bgcolor: "#e0f2f1", p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Documents
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalDocuments}
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    ) : (
                        <Box textAlign="center" py={4}>
                            <Typography color="text.secondary">
                                Click "Refresh" to load database statistics
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Actions Card */}
            <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                        Database Actions
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ border: "2px solid #4caf50", p: 3 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <CheckCircle sx={{ color: "#4caf50", fontSize: 32 }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Refactor Database
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Clear all data (except admin users) and seed with fresh sample data.
                                    Perfect for development and testing.
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    onClick={() =>
                                        openConfirmDialog(
                                            "refactor",
                                            "Refactor Database?",
                                            "This will clear all data (except admin users) and seed with fresh sample data. This action cannot be undone.",
                                            handleRefactorDatabase
                                        )
                                    }
                                    sx={{
                                        bgcolor: "#4caf50",
                                        "&:hover": { bgcolor: "#45a049" },
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Refactor Database"}
                                </Button>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ border: "2px solid #2196f3", p: 3 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <DataObject sx={{ color: "#2196f3", fontSize: 32 }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Seed Sample Data
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Add sample products to the database. Useful for testing without clearing
                                    existing data.
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    onClick={() =>
                                        openConfirmDialog(
                                            "seed",
                                            "Seed Sample Data?",
                                            "This will add sample products to your database.",
                                            handleSeedData
                                        )
                                    }
                                    sx={{
                                        bgcolor: "#2196f3",
                                        "&:hover": { bgcolor: "#1976d2" },
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Seed Data"}
                                </Button>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ border: "2px solid #ff9800", p: 3 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Delete sx={{ color: "#ff9800", fontSize: 32 }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Clear All Data
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Remove all data from the database except admin users. Use with caution!
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    onClick={() =>
                                        openConfirmDialog(
                                            "clear",
                                            "Clear All Data?",
                                            "This will permanently delete all data except admin users. This action cannot be undone!",
                                            handleClearAll
                                        )
                                    }
                                    sx={{
                                        bgcolor: "#ff9800",
                                        "&:hover": { bgcolor: "#f57c00" },
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Clear All Data"}
                                </Button>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ border: "2px solid #9e9e9e", p: 3, opacity: 0.6 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Storage sx={{ color: "#9e9e9e", fontSize: 32 }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        More Actions
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Additional database management features coming soon.
                                </Typography>
                                <Button variant="outlined" fullWidth disabled>
                                    Coming Soon
                                </Button>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Warning sx={{ color: "#ff9800" }} />
                        {confirmDialog.title}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>{confirmDialog.message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDialog.onConfirm}
                        variant="contained"
                        color="warning"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
