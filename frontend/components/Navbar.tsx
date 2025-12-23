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
  Logout,
  ShoppingBag,
  AccountCircle,
  Favorite,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, logout, getToken } from "@/lib/auth";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { API_ENDPOINTS } from "@/lib/api-config";

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
  const { itemCount } = useCart();
  const { wishlistCount, refreshWishlist } = useWishlist();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        fetchUserProfile();
      }
    };

    checkAuth();
    // Re-check auth on every navigation
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      // Silently fail - user profile is not critical for navigation
      console.debug("Failed to fetch profile:", err);
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
        borderBottom: "1px solid #E8E8E8",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          component={Link}
          href="/"
          sx={{
            textDecoration: "none",
            color: "#EB1700",
            letterSpacing: "-0.5px",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          🛍️ EcoMart
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            component={Link}
            href="/"
            sx={{
              color: "#191919",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "15px",
              "&:hover": {
                backgroundColor: "#F8F9FA",
                color: "#EB1700",
              },
            }}
          >
            Home
          </Button>
          <Button
            component={Link}
            href="/products"
            sx={{
              color: "#191919",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "15px",
              "&:hover": {
                backgroundColor: "#F8F9FA",
                color: "#EB1700",
              },
            }}
          >
            Products
          </Button>

          {authenticated ? (
            <>
              <IconButton
                component={Link}
                href="/cart"
                sx={{
                  color: "#191919",
                  "&:hover": {
                    backgroundColor: "#F8F9FA",
                    color: "#EB1700",
                  },
                }}
              >
                <Badge
                  badgeContent={itemCount}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#EB1700",
                      color: "white",
                    },
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>

              <IconButton
                component={Link}
                href="/wishlist"
                onClick={refreshWishlist}
                sx={{
                  color: "#191919",
                  "&:hover": {
                    backgroundColor: "#F8F9FA",
                    color: "#EB1700",
                  },
                }}
              >
                <Badge
                  badgeContent={wishlistCount}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#EB1700",
                      color: "white",
                    },
                  }}
                >
                  <Favorite />
                </Badge>
              </IconButton>

              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  ml: 1,
                  "&:hover": {
                    backgroundColor: "#F8F9FA",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#EB1700",
                    fontSize: "0.95rem",
                    fontWeight: 600,
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
              <Button
                component={Link}
                href="/login"
                sx={{
                  color: "#191919",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "15px",
                  "&:hover": {
                    backgroundColor: "#F8F9FA",
                    color: "#EB1700",
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                component={Link}
                href="/register"
                sx={{
                  backgroundColor: "#EB1700",
                  color: "white",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "15px",
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#C91400",
                    boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                  },
                }}
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
