"use client";

import POSLayoutNew from "@/components/layout/POSLayoutNew";

export default function Home() {
    return (
        <POSLayoutNew>
            {/* 
        In Next.js, the main POS logic is inside POSLayoutNew.
        When on home page, it renders the ProductGrid automatically.
        This provides a seamless experience for the staff.
      */}
            <div className="hidden">Market Dashboard</div>
        </POSLayoutNew>
    );
}
