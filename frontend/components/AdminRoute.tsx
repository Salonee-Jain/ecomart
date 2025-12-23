"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getToken } from "@/lib/auth";
import { CircularProgress, Container, Typography, Alert, Box } from "@mui/material";
import { API_ENDPOINTS } from "@/lib/api-config";

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkAdminAccess = async () => {
            if (!isAuthenticated()) {
                router.push("/admin-login");
                return;
            }

            try {
                const response = await fetch(API_ENDPOINTS.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                });

                if (!response.ok) {
                    // Token is invalid, redirect to admin login
                    router.push("/admin-login");
                    return;
                }

                const user = await response.json();
                if (!user.isAdmin) {
                    // User is logged in but not an admin, redirect to home with error
                    setError("Access denied. Admin privileges required.");
                    setTimeout(() => {
                        router.push("/");
                    }, 2000);
                } else {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Failed to verify admin access:", error);
                router.push("/admin-login");
            } finally {
                setIsVerifying(false);
            }
        };

        checkAdminAccess();
    }, [router]);

    // Show loading while verifying
    if (isVerifying) {
        return (
            <Container sx={{ py: 8, textAlign: "center" }}>
                <CircularProgress sx={{ color: "#EB1700" }} />
                <Typography sx={{ mt: 2 }}>Verifying access...</Typography>
            </Container>
        );
    }

    // Show error message if not admin
    if (error) {
        return (
            <Container sx={{ py: 8, textAlign: "center" }}>
                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                        Redirecting to home page...
                    </Typography>
                </Box>
            </Container>
        );
    }

    // Only render children if user is admin
    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
}
