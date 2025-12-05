import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaTimes, FaBell } from 'react-icons/fa';
import { getNotifications } from '../services/api';

const NotificationModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('buyer');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications(1, 100);
      if (response.success) {
        setNotifications(response.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications by target audience and type
  const buyerNotifications = notifications.filter(
    (n) => n.type === 'buyer_message' || n.targetAudience === 'buyers'
  );
  const sellerNotifications = notifications.filter(
    (n) => n.type === 'seller_message' || n.targetAudience === 'sellers'
  );
  const affiliateNotifications = notifications.filter(
    (n) => n.type === 'affiliate_message' || n.targetAudience === 'affiliates'
  );

  const getNotificationsByTab = () => {
    switch (activeTab) {
      case 'buyer':
        return buyerNotifications;
      case 'seller':
        return sellerNotifications;
      case 'affiliate':
        return affiliateNotifications;
      default:
        return [];
    }
  };

  const getNotificationIcon = (type) => {
    if (type === 'buyer_message') return '🛒';
    if (type === 'seller_message') return '🏪';
    if (type === 'affiliate_message') return '🤝';
    return '🔔';
  };

  const getNotificationColor = (type) => {
    if (type === 'buyer_message') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'seller_message') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (type === 'affiliate_message') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaBell className="text-green-600 text-lg" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-4 sm:px-6">
            <div className="flex gap-2 sm:gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base relative ${
                  activeTab === 'buyer'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Buyer
                {activeTab === 'buyer' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
                {buyerNotifications.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                    {buyerNotifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('seller')}
                className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base relative ${
                  activeTab === 'seller'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Seller
                {activeTab === 'seller' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
                {sellerNotifications.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                    {sellerNotifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('affiliate')}
                className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base relative ${
                  activeTab === 'affiliate'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Affiliate
                {activeTab === 'affiliate' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
                {affiliateNotifications.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                    {affiliateNotifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  {getNotificationsByTab().length > 0 ? (
                  getNotificationsByTab().map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${getNotificationColor(
                        notification.type
                      )} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {notification.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                notification.active
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {notification.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm sm:text-base mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔔</div>
                    <p className="text-gray-500 text-lg font-medium">
                      No {activeTab} notifications yet
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      You'll see notifications here when they arrive
                    </p>
                  </div>
                )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 sm:p-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationModal;

