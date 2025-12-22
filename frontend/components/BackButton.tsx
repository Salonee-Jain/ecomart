"use client";

import { Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface BackButtonProps {
    label: string;
    onClick: () => void;
}

export default function BackButton({ label, onClick }: BackButtonProps) {
    return (
        <Button
            startIcon={<ArrowBack />}
            onClick={onClick}
            sx={{
                mb: 3,
                fontWeight: 600,
                borderRadius: 2,
                color: "#191919",
                textTransform: "none",
                "&:hover": {
                    backgroundColor: "#F8F9FA",
                    color: "#EB1700",
                },
            }}
        >
            {label}
        </Button>
    );
}
