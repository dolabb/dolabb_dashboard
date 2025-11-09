import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-open sidebar on desktop, keep closed on mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 min-w-0 lg:ml-64">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="mt-14 sm:mt-16 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
