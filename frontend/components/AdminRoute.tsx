"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getToken } from "@/lib/auth";
import { CircularProgress, Container, Typography } from "@mui/material";

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminAccess = async () => {
            if (!isAuthenticated()) {
                router.push("/admin-login");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/api/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                });

                if (!response.ok) {
                    router.push("/admin-login");
                    return;
                }

                const user = await response.json();
                if (!user.isAdmin) {
                    router.push("/admin-login");
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
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Verifying access...</Typography>
            </Container>
        );
    }

    // Only render children if user is admin
    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
}
