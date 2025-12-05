import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaBox, FaChartBar, FaUsers, FaHandshake, FaImage } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { MdGavel, MdNotifications, MdPayment } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: FaChartBar },
  { path: '/users', label: 'User Management', icon: FaUsers },
  { path: '/listings', label: 'Listing Management', icon: FaBox },
  { path: '/transactions', label: 'Transactions & Payments', icon: MdPayment },
  { path: '/disputes', label: 'Disputes & Complaints', icon: MdGavel },
  { path: '/notifications', label: 'Notifications', icon: MdNotifications },
  { path: '/affiliates', label: 'Affiliate Management', icon: FaHandshake },
  { path: '/hero-section', label: 'Hero Section', icon: FaImage },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLinkClick = () => {
    // Close sidebar on mobile/tablet when a link is clicked
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay - Only shows on mobile/tablet when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='fixed inset-0 bg-black/50 z-40 lg:hidden'
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : isOpen ? 0 : -256,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 lg:h-screen h-full bg-white text-gray-900 z-50 lg:z-auto border-r border-gray-200 ${
          isOpen ? 'w-64' : 'w-0 lg:w-64'
        } overflow-hidden`}
      >
        <div className='flex flex-col h-full w-64'>
          {/* Logo/Header */}
          <div className='p-4 sm:p-6 mt-10  flex items-center justify-between flex-shrink-0'>
            {/* Close (X) Button - Only visible on mobile/tablet when sidebar is open */}
            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className='lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2'
                aria-label='Close sidebar'
              >
                <HiX className='text-xl' />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className='flex-1 p-2 sm:p-4 space-y-2 overflow-y-auto'>
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-green-600 text-white font-semibold shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                    }`
                  }
                >
                  <Icon className='text-lg sm:text-xl flex-shrink-0' />
                  <span className='text-sm sm:text-base truncate'>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
