"use client";

import { Component, ReactNode } from "react";
import { Container, Typography, Button, Box, Alert } from "@mui/material";
import { Refresh, Home } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, color: "#EB1700" }}>
              Oops! Something went wrong
            </Typography>
            
            <Alert severity="error" sx={{ my: 4, textAlign: "left" }}>
              <Typography variant="h6" gutterBottom>
                Error Details:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                {this.state.error?.message || "An unexpected error occurred"}
              </Typography>
            </Alert>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We apologize for the inconvenience. Please try again or return to the home page.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                sx={{
                  bgcolor: "#EB1700",
                  "&:hover": { bgcolor: "#C91400" },
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
                sx={{
                  borderColor: "#EB1700",
                  color: "#EB1700",
                  "&:hover": { borderColor: "#C91400", bgcolor: "#FFF5F5" },
                }}
              >
                Go to Home
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
