"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Person,
  Email,
  ShoppingBag,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";
import { getToken, isAuthenticated, logout } from "@/lib/auth";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchUserProfile();
    fetchOrders();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders/my", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data || []);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async () => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update profile");
      }

      const data = await response.json();
      setUser(data);
      setEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          password: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to change password");
      }

      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">Failed to load profile</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: "2.5rem",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              {user.isAdmin && (
                <Chip label="Admin" color="primary" size="small" sx={{ mt: 1 }} />
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Quick Stats
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Total Orders:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {orders.length}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Completed:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {orders.filter((o) => o.isDelivered).length}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Total Spent:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  ${orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details & Orders */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Account Settings" />
              <Tab label="Change Password" />
              <Tab label="Order History" />
            </Tabs>

            <CardContent sx={{ p: 3 }}>
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

              {/* Account Settings Tab */}
              {tabValue === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700}>
                      Account Information
                    </Typography>
                    {!editing ? (
                      <Button
                        startIcon={<Edit />}
                        variant="outlined"
                        onClick={() => setEditing(true)}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Box display="flex" gap={1}>
                        <Button
                          startIcon={<Save />}
                          variant="contained"
                          onClick={handleUpdateProfile}
                        >
                          Save
                        </Button>
                        <Button
                          startIcon={<Cancel />}
                          variant="outlined"
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              ...formData,
                              name: user.name,
                              email: user.email,
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: "text.secondary" }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Change Password Tab */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Change Password
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        fullWidth
                      >
                        Change Password
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Order History Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Recent Orders
                  </Typography>
                  {orders.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <ShoppingBag sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                      <Typography color="text.secondary">No orders yet</Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => router.push("/products")}
                      >
                        Start Shopping
                      </Button>
                    </Box>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <Card key={order._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                ${order.totalPrice.toFixed(2)}
                              </Typography>
                              <Chip
                                label={order.isDelivered ? "Delivered" : order.isPaid ? "Processing" : "Pending"}
                                size="small"
                                color={order.isDelivered ? "success" : order.isPaid ? "info" : "warning"}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  {orders.length > 5 && (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => router.push("/orders")}
                    >
                      View All Orders
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
