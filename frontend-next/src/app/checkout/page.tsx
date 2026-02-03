"use client";

import CheckoutPage from "@/orders/CheckoutPage";
import POSLayoutNew from "@/components/layout/POSLayoutNew";

// Checkout on Next.js will be wrapped in POSLayoutNew like the updated Vite logic
export default function Checkout() {
    return (
        <POSLayoutNew />
    );
}
