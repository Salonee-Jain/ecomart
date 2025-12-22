"use client";

import { Box, Container, Typography, Button } from "@mui/material";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon,
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <Box
            sx={{
                background: "#FFFFFF",
                minHeight: "calc(100vh - 64px)",
                py: 8,
            }}
        >
            <Container sx={{ textAlign: "center" }}>
                {icon && <Box sx={{ mb: 2 }}>{icon}</Box>}
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        color: "#191919",
                        fontWeight: 700,
                    }}
                >
                    {title}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {message}
                </Typography>
                {actionLabel && onAction && (
                    <Button
                        variant="contained"
                        size="large"
                        onClick={onAction}
                        sx={{
                            background: "#EB1700",
                            boxShadow: "none",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 4,
                            "&:hover": {
                                background: "#C91400",
                                boxShadow: "0 2px 8px rgba(235, 23, 0, 0.3)",
                            },
                        }}
                    >
                        {actionLabel}
                    </Button>
                )}
            </Container>
        </Box>
    );
}
