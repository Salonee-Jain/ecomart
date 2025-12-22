"use client";

import { Container, CircularProgress, Typography } from "@mui/material";

interface LoadingStateProps {
    message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
    return (
        <Container sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress size={60} sx={{ color: "#EB1700" }} />
            <Typography sx={{ mt: 2 }} variant="h6" color="text.secondary">
                {message}
            </Typography>
        </Container>
    );
}
