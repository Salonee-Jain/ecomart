"use client";

import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
    icon: ReactNode;
    title: string;
    action?: ReactNode;
}

export default function PageHeader({ icon, title, action }: PageHeaderProps) {
    return (
        <Box
            sx={{
                mb: 4,
                py: 3,
                px: 4,
                borderRadius: 2,
                background: "#FAFAFA",
                border: "1px solid #E8E8E8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
            }}
        >
            <Box display="flex" alignItems="center" gap={2}>
                {icon}
                <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{
                        color: "#191919",
                        letterSpacing: "-0.5px",
                    }}
                >
                    {title}
                </Typography>
            </Box>
            {action && <Box>{action}</Box>}
        </Box>
    );
}
