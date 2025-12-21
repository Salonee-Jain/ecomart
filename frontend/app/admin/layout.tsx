"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import {
    Menu as MenuIcon,
    Dashboard,
    Inventory,
    ShoppingBag,
    People,
    Logout,
    ChevronLeft,
    Payment,
} from "@mui/icons-material";
import AdminRoute from "@/components/AdminRoute";
import { logout } from "@/lib/auth";

const drawerWidth = 260;

const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/admin" },
    { text: "Products", icon: <Inventory />, path: "/admin/products" },
    { text: "Orders", icon: <ShoppingBag />, path: "/admin/orders" },
    { text: "Users", icon: <People />, path: "/admin/users" },
    { text: "Payments", icon: <Payment />, path: "/admin/payments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        router.push("/admin-login");
    };

    const drawer = (
        <Box>
            <Toolbar
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    py: 2,
                }}
            >
                <Typography variant="h6" fontWeight={700} color="primary">
                    Admin Panel
                </Typography>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle}>
                        <ChevronLeft />
                    </IconButton>
                )}
            </Toolbar>
            <Divider />
            <List sx={{ px: 2, py: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={pathname === item.path}
                            onClick={() => {
                                router.push(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                borderRadius: 2,
                                "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: "primary.dark",
                                    },
                                    "& .MuiListItemIcon-root": {
                                        color: "white",
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List sx={{ px: 2, py: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            color: "error.main",
                            "&:hover": {
                                bgcolor: "error.light",
                                color: "error.dark",
                            },
                        }}
                    >
                        <ListItemIcon>
                            <Logout color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AdminRoute>
            <Box sx={{ display: "flex" }}>
                <AppBar
                    position="fixed"
                    sx={{
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        ml: { md: `${drawerWidth}px` },
                        bgcolor: "white",
                        color: "text.primary",
                        boxShadow: 1,
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: "none" } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" fontWeight={600}>
                            EcoMart Admin
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box
                    component="nav"
                    sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                >
                    {/* Mobile drawer */}
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Better mobile performance
                        }}
                        sx={{
                            display: { xs: "block", md: "none" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>

                    {/* Desktop drawer */}
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: "none", md: "block" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                                borderRight: "1px solid",
                                borderColor: "divider",
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        minHeight: "100vh",
                        bgcolor: "#f5f5f5",
                    }}
                >
                    <Toolbar /> {/* Spacer for AppBar */}
                    {children}
                </Box>
            </Box>
        </AdminRoute>
    );
}
