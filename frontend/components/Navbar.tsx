"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "white",
        borderBottom: "1px solid #eee",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          fontWeight={800}
          color="primary"
          component={Link}
          href="/"
          sx={{ textDecoration: "none" }}
        >
          EcoMart
        </Typography>

        <Box>
          <Button component={Link} href="/cart">
            Cart
          </Button>

          {user ? (
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              Logout
            </Button>
          ) : (
            <Button component={Link} href="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
