"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container minHeight="100vh">
      {/* LEFT BRAND PANEL */}
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          display: { xs: "none", md: "flex" },
          background:
            "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
          color: "white",
          alignItems: "center",
          px: 8,
        }}
      >
        <Box maxWidth={480}>
          <Typography variant="h3" fontWeight={800}>
            EcoMart 🌱
          </Typography>
          <Typography mt={3} fontSize={18} color="rgba(255,255,255,0.9)">
            Thoughtfully designed sustainable products that look good
            and do good.
          </Typography>
        </Box>
      </Grid>

      {/* RIGHT LOGIN PANEL */}
      <Grid
        item
        xs={12}
        md={6}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxWidth="sm">
          <Paper
            elevation={4}
            sx={{
              p: 5,
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Sign in
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Welcome back — continue to EcoMart
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" mt={4} onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.4,
                  fontWeight: 600,
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "#1b5e20",
                  },
                }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Box>

            <Typography textAlign="center" mt={4} fontSize={14}>
              Don’t have an account?{" "}
              <Link
                href="/register"
                style={{
                  color: "#2e7d32",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create one
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Grid>
    </Grid>
  );
}
