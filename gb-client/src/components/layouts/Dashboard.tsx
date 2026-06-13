import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardTopNav from '../ui/dashboardMobile/DashboardTopNav';
import DashboardBottomNav from '../ui/dashboardMobile/DashboardBottomNav';
import DashboardMobileMenu from '../ui/dashboardMobile/DashboardMobileMenu';

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
  <>
   <div className="min-h-screen bg-gray-50">
      <DashboardTopNav
        onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-md">
          <DashboardMobileMenu onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <main className="pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <DashboardBottomNav />
    </div>
  </>
  );
};

export default Dashboard;