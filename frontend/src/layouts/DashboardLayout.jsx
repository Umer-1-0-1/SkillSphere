import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '../components/layout/DashboardSidebar';
import { Navigation } from '../components/layout/Navigation';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navigation />
      <DashboardSidebar />
      <main className="ml-64 min-h-screen p-8 pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
