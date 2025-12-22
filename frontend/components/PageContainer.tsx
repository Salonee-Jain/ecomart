"use client";

import { Box } from "@mui/material";
import { ReactNode } from "react";

interface PageContainerProps {
    children: ReactNode;
    gradient?: boolean;
}

export default function PageContainer({
    children,
    gradient = false,
}: PageContainerProps) {
    return (
        <Box
            sx={{
                background: gradient
                    ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                    : "#FFFFFF",
                minHeight: "calc(100vh - 64px)",
                py: 4,
            }}
        >
            {children}
        </Box>
    );
}
