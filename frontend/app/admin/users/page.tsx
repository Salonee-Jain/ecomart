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
    Avatar,
    Grid,
} from "@mui/material";
import {
    Search,
    People,
    AdminPanelSettings,
    Person,
    Email,
} from "@mui/icons-material";
import { getAllUsers } from "@/services/admin.service";

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [stats, setStats] = useState({
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users;

        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            const usersList = data.users || [];
            setUsers(usersList);
            setFilteredUsers(usersList);

            const admins = usersList.filter((u: User) => u.isAdmin).length;

            setStats({
                totalUsers: usersList.length || 0,
                adminUsers: admins || 0,
                regularUsers: (usersList.length - admins) || 0,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
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
            title: "Total Users",
            value: stats.totalUsers,
            icon: <People sx={{ fontSize: 40, color: "#1976d2" }} />,
            color: "#e3f2fd",
        },
        {
            title: "Administrators",
            value: stats.adminUsers,
            icon: <AdminPanelSettings sx={{ fontSize: 40, color: "#f44336" }} />,
            color: "#ffebee",
        },
        {
            title: "Regular Users",
            value: stats.regularUsers,
            icon: <Person sx={{ fontSize: 40, color: "#4caf50" }} />,
            color: "#e8f5e9",
        },
    ];

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = ["#1976d2", "#4caf50", "#ff9800", "#9c27b0", "#e91e63", "#00bcd4"];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                👥 User Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statsCards.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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

            {/* Users Table */}
            <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                    {/* Search */}
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            placeholder="🔍 Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: "auto" }}>
                        <Table>
                            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell><strong>User</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Joined</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user._id} hover sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: getAvatarColor(user.name),
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {getInitials(user.name)}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {user.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Email fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {user.isAdmin ? (
                                                    <Chip
                                                        icon={<AdminPanelSettings fontSize="small" />}
                                                        label="Administrator"
                                                        color="error"
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<Person fontSize="small" />}
                                                        label="Customer"
                                                        color="default"
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                            <People sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                {searchQuery ? "No users found" : "No users yet"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={3}>
                        <Typography variant="body2" color="text.secondary">
                            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
