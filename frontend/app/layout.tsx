import "@/styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "EcoMart",
  description: "Eco-friendly ecommerce store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
