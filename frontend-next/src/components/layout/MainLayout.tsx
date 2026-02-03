"use client";
"use client";
import { Outlet } from 'next/navigation';

export default function MainLayout() {
  return (
    <div className="w-full h-screen">
      <Outlet />
    </div>
  );
}
