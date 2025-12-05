import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  getUsers,
  suspendUser,
  deactivateUser,
  deleteUser,
  reactivateUser,
} from '../services/api';
import { useToast } from '../components/Toast';

const UserManagement = () => {
  const { success, error: showError } = useToast();
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, userId: null, message: '' });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'all' ? null : filter;
      const response = await getUsers(currentPage, 20, status);
      if (response.success) {
        setUsers(response.users || []);
        setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (err) {
      setError('An error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (userId, action) => {
    const actionMessages = {
      suspend: 'Are you sure you want to suspend this user?',
      deactivate: 'Are you sure you want to deactivate this user?',
      delete: 'Are you sure you want to delete this user?',
      reactivate: 'Are you sure you want to reactivate this user?',
    };
    
    setConfirmModal({
      show: true,
      action,
      userId,
      message: actionMessages[action] || `Are you sure you want to ${action} this user?`,
    });
  };

  const handleConfirmAction = async () => {
    const { userId, action } = confirmModal;
    setConfirmModal({ show: false, action: null, userId: null, message: '' });
    
    setActionLoading(userId);
    try {
      let response;
      switch (action) {
        case 'suspend':
          response = await suspendUser(userId);
          break;
        case 'deactivate':
          response = await deactivateUser(userId);
          break;
        case 'delete':
          response = await deleteUser(userId);
          break;
        case 'reactivate':
          response = await reactivateUser(userId);
          break;
        default:
          return;
      }

      if (response.success) {
        const actionMessages = {
          suspend: 'User suspended successfully',
          deactivate: 'User deactivated successfully',
          delete: 'User deleted successfully',
          reactivate: 'User reactivated successfully',
        };
        success(actionMessages[action] || `User ${action}ed successfully`);
        fetchUsers();
      } else {
        showError(response.error || `Failed to ${action} user`);
      }
    } catch (err) {
      showError(`An error occurred while ${action}ing user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmModal({ show: false, action: null, userId: null, message: '' });
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      deactivated: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors[status] || colors.active}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap">User Management</h1>
        <p className="text-gray-600 text-sm sm:text-base whitespace-nowrap">Manage all users (buyers & sellers) and account history</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => { setFilter('active'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setFilter('suspended'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'suspended' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Suspended
          </button>
          <button
            onClick={() => { setFilter('deactivated'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'deactivated' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Deactivated
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 text-gray-900">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">User</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Type</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Join Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Activity</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 whitespace-nowrap">{user.name}</p>
                          <p className="text-sm text-gray-600 whitespace-nowrap">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          user.type === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {user.type || 'user'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                        {user.Activity ? (
                          <span className="whitespace-nowrap">
                            Purchases: {user.Activity.totalPurchases || 0} | Spent: ${(user.Activity.totalSpent || 0).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">No activity</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {user.status !== 'deleted' && (
                          <div className="flex gap-2 flex-wrap">
                            {user.status === 'active' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleActionClick(user._id || user.id, 'suspend'); }}
                                  disabled={actionLoading === (user._id || user.id)}
                                  className="px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 whitespace-nowrap disabled:opacity-50"
                                >
                                  {actionLoading === (user._id || user.id) ? '...' : 'Suspend'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleActionClick(user._id || user.id, 'deactivate'); }}
                                  disabled={actionLoading === (user._id || user.id)}
                                  className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 whitespace-nowrap disabled:opacity-50"
                                >
                                  {actionLoading === (user._id || user.id) ? '...' : 'Deactivate'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleActionClick(user._id || user.id, 'delete'); }}
                                  disabled={actionLoading === (user._id || user.id)}
                                  className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 whitespace-nowrap disabled:opacity-50"
                                >
                                  {actionLoading === (user._id || user.id) ? '...' : 'Delete'}
                                </button>
                              </>
                            )}
                            {user.status === 'suspended' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleActionClick(user._id || user.id, 'deactivate'); }}
                                  disabled={actionLoading === (user._id || user.id)}
                                  className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 whitespace-nowrap disabled:opacity-50"
                                >
                                  {actionLoading === (user._id || user.id) ? '...' : 'Deactivate'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleActionClick(user._id || user.id, 'delete'); }}
                                  disabled={actionLoading === (user._id || user.id)}
                                  className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 whitespace-nowrap disabled:opacity-50"
                                >
                                  {actionLoading === (user._id || user.id) ? '...' : 'Delete'}
                                </button>
                              </>
                            )}
                            {user.status === 'deactivated' && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleActionClick(user._id || user.id, 'reactivate'); }}
                                  disabled={actionLoading === (user._id || user.id)}
                                  className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 whitespace-nowrap disabled:opacity-50"
                                >
                                  {actionLoading === (user._id || user.id) ? '...' : 'Active'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleActionClick(user._id || user.id, 'delete'); }}
                                  disabled={actionLoading === (user._id || user.id)}
                                  className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 whitespace-nowrap disabled:opacity-50"
                                >
                                  {actionLoading === (user._id || user.id) ? '...' : 'Delete'}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
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
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelAction}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Confirm Action</h2>
            <p className="text-gray-700 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelAction}
                className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                No
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Yes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 whitespace-nowrap">{selectedUser.name}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Email</p>
                <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Type</p>
                <p className="font-semibold text-gray-900 capitalize whitespace-nowrap">{selectedUser.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Status</p>
                {getStatusBadge(selectedUser.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Account History</p>
                <div className="space-y-2">
                  {selectedUser.accountHistory?.length > 0 ? (
                    selectedUser.accountHistory.map((history, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-nowrap"><strong className="text-gray-900">{history.date}</strong> - {history.action}: {history.item} (${history.amount?.toLocaleString()})</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 whitespace-nowrap">No history available</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserManagement;
