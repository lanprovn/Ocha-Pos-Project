import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="w-full h-screen">
      <Outlet />
    </div>
  );
}
