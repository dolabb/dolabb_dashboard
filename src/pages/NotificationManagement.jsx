import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaEdit, FaPaperPlane, FaTimes, FaCheck, FaPlus } from 'react-icons/fa';
import {
  getNotifications,
  getNotificationTemplates,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  toggleNotificationStatus,
} from '../services/api';

const NotificationManagement = () => {
  const [notificationCategory, setNotificationCategory] = useState('all'); // 'all', 'buyer', 'seller', 'affiliate'
  const [notificationsList, setNotificationsList] = useState([]);
  const [notificationTemplates, setNotificationTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNotification, setNewNotification] = useState({
    type: 'system_alert',
    title: '',
    message: '',
    targetAudience: 'all',
    active: true,
    template: '',
  });
  const [editingNotification, setEditingNotification] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateVariables, setTemplateVariables] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendNotificationData, setSendNotificationData] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, [currentPage, notificationCategory]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const type = notificationCategory !== 'all' ? (notificationCategory === 'buyer' ? 'buyer_message' : notificationCategory === 'seller' ? 'seller_message' : 'affiliate_message') : null;
      const targetAudience = notificationCategory !== 'all' ? notificationCategory : null;
      const response = await getNotifications(currentPage, 20, type, targetAudience);
      if (response.success) {
        setNotificationsList(response.notifications || []);
        setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setError(response.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError('An error occurred while loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await getNotificationTemplates();
      if (response.success) {
        setNotificationTemplates(response.templates || {});
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  // Group templates by category
  const templateCategories = {
    account: ['account_registration', 'password_change'],
    buyer_journey: [
      'buyer_offer_submitted',
      'buyer_offer_accepted',
      'buyer_offer_rejected',
      'buyer_purchase_confirmation',
      'buyer_item_shipped',
      'buyer_feedback_reminder',
    ],
    seller_journey: [
      'seller_offer_received',
      'seller_offer_accepted',
      'seller_offer_rejected',
      'seller_payment_received',
      'seller_shipment_reminder',
      'seller_feedback_received',
    ],
    affiliate_journey: [
      'affiliate_registration',
      'affiliate_referral_success',
      'affiliate_commission_earned',
      'affiliate_payout_approved',
      'affiliate_payout_rejected',
      'affiliate_milestone_reached',
    ],
  };

  const getTemplateDisplayName = (key) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleTemplateSelect = (templateKey) => {
    if (!templateKey) {
      setSelectedTemplate('');
      setNewNotification({
        ...newNotification,
        type: 'system_alert',
        title: '',
        message: '',
        targetAudience: 'all',
      });
      setTemplateVariables({});
      return;
    }

    const template = notificationTemplates[templateKey];
    if (template) {
      setSelectedTemplate(templateKey);
      setNewNotification({
        ...newNotification,
        type: template.type,
        title: template.title,
        message: template.message,
        targetAudience: template.targetAudience,
        template: templateKey,
      });

      // Extract variables from message
      const variables = template.message.match(/\$\{(\w+)\}/g) || [];
      const varMap = {};
      variables.forEach((varStr) => {
        const varName = varStr.replace(/\$\{|\}/g, '');
        varMap[varName] = '';
      });
      setTemplateVariables(varMap);
    }
  };

  const replaceTemplateVariables = (message, variables) => {
    let result = message;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(regex, variables[key] || `[${key}]`);
    });
    return result;
  };

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill in all required fields');
      return;
    }

    const finalMessage = replaceTemplateVariables(
      newNotification.message,
      templateVariables
    );

    const notificationData = {
      ...newNotification,
      message: finalMessage,
    };

    try {
      const response = await createNotification(notificationData);
      if (response.success) {
        alert('Notification created successfully!');
        setNewNotification({
          type: 'system_alert',
          title: '',
          message: '',
          targetAudience: 'all',
          active: true,
          template: '',
        });
        setSelectedTemplate('');
        setTemplateVariables({});
        setShowCreateModal(false);
        fetchNotifications();
      } else {
        alert(response.error || 'Failed to create notification');
      }
    } catch (err) {
      alert('An error occurred while creating notification');
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification({ ...notification });
    setShowCreateModal(true);
    // Find if it's from a template
    const templateKey = Object.keys(notificationTemplates).find(
      (key) =>
        notificationTemplates[key].title === notification.title ||
        notificationTemplates[key].message === notification.message
    );
    if (templateKey) {
      setSelectedTemplate(templateKey);
      handleTemplateSelect(templateKey);
    }
  };

  const handleUpdateNotification = async () => {
    if (!editingNotification.title || !editingNotification.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const notificationId = editingNotification.id || editingNotification._id;
      const response = await updateNotification(notificationId, editingNotification);
      if (response.success) {
        alert('Notification updated successfully!');
        setEditingNotification(null);
        setSelectedTemplate('');
        setTemplateVariables({});
        setShowCreateModal(false);
        fetchNotifications();
      } else {
        alert(response.error || 'Failed to update notification');
      }
    } catch (err) {
      alert('An error occurred while updating notification');
    }
  };

  const handleSendNotification = (notification) => {
    setSendNotificationData(notification);
    setShowSendModal(true);
  };

  const confirmSendNotification = async () => {
    if (!sendNotificationData) return;

    try {
      const notificationId = sendNotificationData.id || sendNotificationData._id;
      const response = await sendNotification(notificationId, true);
      if (response.success) {
        alert(
          `Notification "${sendNotificationData.title}" sent to ${sendNotificationData.targetAudience}!`
        );
        setShowSendModal(false);
        setSendNotificationData(null);
        fetchNotifications();
      } else {
        alert(response.error || 'Failed to send notification');
      }
    } catch (err) {
      alert('An error occurred while sending notification');
    }
  };

  const handleToggleNotification = async (id) => {
    try {
      const notification = notificationsList.find((n) => (n.id || n._id) === id);
      const newActiveStatus = !notification?.active;
      const response = await toggleNotificationStatus(id, newActiveStatus);
      if (response.success) {
        fetchNotifications();
      } else {
        alert(response.error || 'Failed to toggle notification status');
      }
    } catch (err) {
      alert('An error occurred while toggling notification status');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await deleteNotification(id);
        if (response.success) {
          alert('Notification deleted successfully!');
          fetchNotifications();
        } else {
          alert(response.error || 'Failed to delete notification');
        }
      } catch (err) {
        alert('An error occurred while deleting notification');
      }
    }
  };


  // Filter notifications based on selected category
  const getFilteredNotifications = () => {
    if (notificationCategory === 'all') {
      return notificationsList;
    } else if (notificationCategory === 'buyer') {
      return notificationsList.filter(
        (n) => n.type === 'buyer_message' || n.targetAudience === 'buyers'
      );
    } else if (notificationCategory === 'seller') {
      return notificationsList.filter(
        (n) => n.type === 'seller_message' || n.targetAudience === 'sellers'
      );
    } else if (notificationCategory === 'affiliate') {
      return notificationsList.filter(
        (n) => n.type === 'affiliate_message' || n.targetAudience === 'affiliates'
      );
    }
    return notificationsList;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap">
              Notifications
            </h1>
            <p className="text-gray-600 text-sm sm:text-base whitespace-nowrap">
              Manage system messages and alerts
            </p>
          </div>
          <button
            onClick={() => {
              setEditingNotification(null);
              setNewNotification({
                type: 'system_alert',
                title: '',
                message: '',
                targetAudience: 'all',
                active: true,
                template: '',
              });
              setSelectedTemplate('');
              setTemplateVariables({});
              setShowCreateModal(true);
            }}
            className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex items-center gap-2 font-semibold"
          >
            <FaPlus /> Create New Notification
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
          {/* Notification Category Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setNotificationCategory('all')}
                className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base relative ${
                  notificationCategory === 'all'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                All
                {notificationCategory === 'all' && (
                  <motion.div
                    layoutId="notificationCategoryTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                  {notificationsList.length}
                </span>
              </button>
              <button
                onClick={() => setNotificationCategory('buyer')}
                className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base relative ${
                  notificationCategory === 'buyer'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Buyer
                {notificationCategory === 'buyer' && (
                  <motion.div
                    layoutId="notificationCategoryTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                  {notificationsList.filter((n) => n.type === 'buyer_message' || n.targetAudience === 'buyers').length}
                </span>
              </button>
              <button
                onClick={() => setNotificationCategory('seller')}
                className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base relative ${
                  notificationCategory === 'seller'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Seller
                {notificationCategory === 'seller' && (
                  <motion.div
                    layoutId="notificationCategoryTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                  {notificationsList.filter((n) => n.type === 'seller_message' || n.targetAudience === 'sellers').length}
                </span>
              </button>
              <button
                onClick={() => setNotificationCategory('affiliate')}
                className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base relative ${
                  notificationCategory === 'affiliate'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Affiliate
                {notificationCategory === 'affiliate' && (
                  <motion.div
                    layoutId="notificationCategoryTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                  />
                )}
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                  {notificationsList.filter((n) => n.type === 'affiliate_message' || n.targetAudience === 'affiliates').length}
                </span>
              </button>
            </div>
          </div>

          {/* Existing Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                    Existing Notifications
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {getFilteredNotifications().length > 0 ? (
                getFilteredNotifications().map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 sm:p-6 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            notification.type === 'system_alert'
                              ? 'bg-blue-100 text-blue-800'
                              : notification.type === 'seller_message'
                              ? 'bg-purple-100 text-purple-800'
                              : notification.type === 'affiliate_message'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {notification.type.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            notification.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {notification.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          Target: {notification.targetAudience}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                        Created: {notification.createdAt}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleSendNotification(notification)}
                        className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap flex items-center gap-1"
                        title="Send Notification"
                      >
                        <FaPaperPlane /> Send
                      </button>
                      <button
                        onClick={() => handleEditNotification(notification)}
                        className="px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded text-xs font-semibold hover:bg-yellow-600 transition-colors whitespace-nowrap flex items-center gap-1"
                        title="Edit Notification"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleNotification(notification.id || notification._id)}
                        className={`px-3 sm:px-4 py-2 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                          notification.active
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {notification.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification.id || notification._id)}
                        className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🔔</div>
                  <p className="text-gray-500 text-lg font-medium">
                    No {notificationCategory === 'all' ? '' : notificationCategory} notifications found
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {notificationCategory === 'all' 
                      ? 'Create a new notification to get started'
                      : `No ${notificationCategory} notifications available. Create one to get started.`}
                  </p>
                </div>
              )}
                </div>
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

      {/* Create/Edit Notification Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateModal(false);
              setEditingNotification(null);
              setSelectedTemplate('');
              setTemplateVariables({});
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingNotification ? 'Edit Notification' : 'Create New Notification'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNotification(null);
                    setSelectedTemplate('');
                    setTemplateVariables({});
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingNotification?.title || newNotification.title}
                    onChange={(e) =>
                      editingNotification
                        ? setEditingNotification({
                            ...editingNotification,
                            title: e.target.value,
                          })
                        : setNewNotification({
                            ...newNotification,
                            title: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                    Message
                  </label>
                  <textarea
                    value={editingNotification?.message || newNotification.message}
                    onChange={(e) =>
                      editingNotification
                        ? setEditingNotification({
                            ...editingNotification,
                            message: e.target.value,
                          })
                        : setNewNotification({
                            ...newNotification,
                            message: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    rows="4"
                    placeholder="Notification message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                    Target Audience
                  </label>
                  <select
                    value={
                      editingNotification?.targetAudience ||
                      newNotification.targetAudience
                    }
                    onChange={(e) =>
                      editingNotification
                        ? setEditingNotification({
                            ...editingNotification,
                            targetAudience: e.target.value,
                          })
                        : setNewNotification({
                            ...newNotification,
                            targetAudience: e.target.value,
                          })
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">All Users</option>
                    <option value="sellers">Sellers Only</option>
                    <option value="buyers">Buyers Only</option>
                    <option value="affiliates">Affiliates Only</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {editingNotification ? (
                    <>
                      <button
                        onClick={handleUpdateNotification}
                        className="flex-1 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                      >
                        <FaCheck /> Update Notification
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          setEditingNotification(null);
                          setSelectedTemplate('');
                          setTemplateVariables({});
                        }}
                        className="px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap flex items-center gap-2"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCreateNotification}
                        className="flex-1 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                      >
                        <FaCheck /> Create Notification
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          setNewNotification({
                            type: 'system_alert',
                            title: '',
                            message: '',
                            targetAudience: 'all',
                            active: true,
                            template: '',
                          });
                          setSelectedTemplate('');
                          setTemplateVariables({});
                        }}
                        className="px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap flex items-center gap-2"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Notification Modal */}
      {showSendModal && sendNotificationData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSendModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 whitespace-nowrap">
              Send Notification
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Title</p>
                <p className="font-semibold text-gray-900">
                  {sendNotificationData.title}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Message</p>
                <p className="text-gray-900">{sendNotificationData.message}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">
                  Target Audience
                </p>
                <p className="font-semibold text-gray-900 capitalize">
                  {sendNotificationData.targetAudience}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={confirmSendNotification}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
              >
                <FaPaperPlane /> Send Now
              </button>
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationManagement;
