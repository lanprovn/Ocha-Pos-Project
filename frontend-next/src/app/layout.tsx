import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { CartProvider } from "@/features/orders/context/CartContext";
import { ProductProvider } from "@/features/products/context/ProductContext";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-poppins",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Ocha POS | Enterprise-Grade System",
    description: "High-performance POS solution for modern F&B businesses.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" className={`${poppins.variable} ${inter.variable}`}>
            <body className="antialiased selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden bg-slate-50">
                <AuthProvider>
                    <CartProvider>
                        <ProductProvider>
                            {children}
                            <Toaster position="top-right" />
                        </ProductProvider>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
