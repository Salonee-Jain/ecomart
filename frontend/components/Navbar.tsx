"use client";

import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  ShoppingCart,
  Eco,
  Person,
  Logout,
  ShoppingBag,
  AccountCircle,
  Favorite,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, logout, getToken } from "@/lib/auth";

interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        fetchUserProfile();
        fetchCartCount();
        fetchWishlistCount();
      }
    };

    checkAuth();
    // Re-check auth on every navigation
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartCount(data.items?.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/wishlist", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.products?.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    setAuthenticated(false);
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    handleProfileMenuClose();
    router.push(path);
  };

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

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/products">
            Products
          </Button>

          {authenticated ? (
            <>
              <IconButton
                color="inherit"
                component={Link}
                href="/cart"
                onClick={fetchCartCount}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                component={Link}
                href="/wishlist"
                onClick={fetchWishlistCount}
              >
                <Badge badgeContent={wishlistCount} color="error">
                  <Favorite />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "secondary.main",
                    fontSize: "1rem",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                  sx: { minWidth: 220, mt: 1 },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {user?.name || "User"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || ""}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem onClick={() => handleNavigate("/profile")}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>

                <MenuItem onClick={() => handleNavigate("/orders")}>
                  <ListItemIcon>
                    <ShoppingBag fontSize="small" />
                  </ListItemIcon>
                  My Orders
                </MenuItem>

                <MenuItem onClick={() => handleNavigate("/wishlist")}>
                  <ListItemIcon>
                    <Favorite fontSize="small" />
                  </ListItemIcon>
                  My Wishlist
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} href="/login">
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                href="/register"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
