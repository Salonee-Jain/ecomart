import ClientProviders from "@/components/ClientProviders";

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
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
