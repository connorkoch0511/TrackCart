import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GTMProvider } from "@/components/GTMProvider";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { DataLayerInspector } from "@/components/DataLayerInspector";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrackCart — Analytics Demo Store",
  description: "A mock e-commerce store demonstrating GTM + GA4 event tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
        <GTMProvider />
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <DataLayerInspector />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
