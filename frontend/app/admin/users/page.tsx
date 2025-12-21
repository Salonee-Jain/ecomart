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
    IconButton,
    Alert,
    CircularProgress,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import {
    Delete,
    Search,
    AdminPanelSettings,
    Person,
} from "@mui/icons-material";
import { getAllUsers, updateUserRole, deleteUser } from "@/services/admin.service";

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = users.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data.users);
            setFilteredUsers(data.users);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (user: User) => {
        setError("");
        setSuccess("");

        try {
            await updateUserRole(user._id, !user.isAdmin);
            setSuccess(`${user.name} role updated successfully`);
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update role");
        }
    };

    const handleDeleteClick = (user: User) => {
        setDeleteDialog({ open: true, user });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.user) return;

        setError("");
        setSuccess("");

        try {
            await deleteUser(deleteDialog.user._id);
            setSuccess(`${deleteDialog.user.name} deleted successfully`);
            setDeleteDialog({ open: false, user: null });
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to delete user");
            setDeleteDialog({ open: false, user: null });
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
                User Management
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                Manage user accounts and permissions
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
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            placeholder="Search by name or email..."
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
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Joined</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user._id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {user.isAdmin ? (
                                                        <AdminPanelSettings color="primary" fontSize="small" />
                                                    ) : (
                                                        <Person color="disabled" fontSize="small" />
                                                    )}
                                                    <Typography>{user.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.isAdmin ? "Admin" : "User"}
                                                    color={user.isAdmin ? "primary" : "default"}
                                                    size="small"
                                                    onClick={() => handleToggleAdmin(user)}
                                                    sx={{ cursor: "pointer" }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteClick(user)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                {searchQuery ? "No users found" : "No users yet"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            Total: {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, user: null })}
            >
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <strong>{deleteDialog.user?.name}</strong>? This
                    action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
