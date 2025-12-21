"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { register } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await register({ name, email, password });
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 5 }}>
        <Typography variant="h4" fontWeight={700}>
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" mt={4} onSubmit={submit}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            type="submit"
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
