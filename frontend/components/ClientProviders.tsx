"use client";

import { ThemeProvider } from "@mui/material";
import theme from "@/lib/theme";
import dynamic from "next/dynamic";

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
      <Navbar />
      {children}
    </ThemeProvider>
  );
}
