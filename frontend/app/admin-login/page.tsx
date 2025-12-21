"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    InputAdornment,
    IconButton,
} from "@mui/material";
import {
    Email,
    Lock,
    AdminPanelSettings,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import { login } from "@/services/auth.service";

export default function AdminLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await login(formData);
            const user = response.data;

            // Check if user is admin
            if (!user.isAdmin) {
                setError("Access denied. Admin privileges required.");
                setLoading(false);
                return;
            }

            // Store token and redirect to admin dashboard
            localStorage.setItem("token", user.token);
            router.push("/admin");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials");
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f5f5f5",
                backgroundImage:
                    "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Card sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box textAlign="center" mb={4}>
                            <Box
                                sx={{
                                    display: "inline-flex",
                                    p: 2,
                                    borderRadius: "50%",
                                    bgcolor: "primary.main",
                                    color: "white",
                                    mb: 2,
                                }}
                            >
                                <AdminPanelSettings sx={{ fontSize: 40 }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Admin Login
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Enter your admin credentials to access the admin panel
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                required
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                required
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mb: 2, py: 1.5 }}
                            >
                                {loading ? "Signing in..." : "Sign In as Admin"}
                            </Button>

                            <Box textAlign="center">
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => router.push("/login")}
                                >
                                    Regular User Login
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>

                <Box textAlign="center" mt={3}>
                    <Typography variant="body2" color="text.secondary">
                        Admin access only. Unauthorized access is prohibited.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
