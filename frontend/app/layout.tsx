import ClientProviders from "@/components/ClientProviders";
import "@/styles/globals.css";

export const metadata = {
  title: "EcoMart",
  description: "Sustainable shopping platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
