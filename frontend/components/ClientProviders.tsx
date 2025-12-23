"use client";

import { ThemeProvider } from "@mui/material";
import theme from "@/lib/theme";
import dynamic from "next/dynamic";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
});

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            {children}
          </WishlistProvider>
        </CartProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
