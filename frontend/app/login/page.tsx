"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  Link as MuiLink,
  Avatar,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveToken, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token using utility function
      saveToken(data.token);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      py: 4,
    }}>
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "white",
            border: "1px solid #E8E8E8",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 5 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mb: 2,
                  background: "#EB1700",
                }}
              >
                <LockOutlined sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography
                variant="h3"
                fontWeight={700}
                gutterBottom
                textAlign="center"
                sx={{
                  color: "#191919",
                  letterSpacing: "-0.5px",
                }}
              >
                Sign in
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Welcome back to EcoMart
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#EB1700",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#EB1700",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#EB1700",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#EB1700",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#EB1700",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#EB1700",
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: "1rem",
                  background: "#EB1700",
                  boxShadow: "none",
                  textTransform: "none",
                  "&:hover": {
                    background: "#C91400",
                    boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <Typography variant="body2" textAlign="center" color="text.secondary">
                Don't have an account?{" "}
                <MuiLink
                  component={Link}
                  href="/register"
                  underline="hover"
                  sx={{
                    color: "#EB1700",
                    fontWeight: 600,
                    "&:hover": {
                      color: "#C91400",
                    },
                  }}
                >
                  Sign up
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}