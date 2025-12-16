import { Outlet } from 'react-router-dom';
import { Navigation } from '../components/layout/Navigation';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navigation />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
