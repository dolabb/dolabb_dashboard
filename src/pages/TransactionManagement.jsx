import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  getTransactions,
  getCashoutRequests,
  approveCashout,
  rejectCashout,
  getFeeSettings,
  updateFeeSettings,
  getFeeCollectionSummary,
} from '../services/api';

const TransactionManagement = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [cashoutRequests, setCashoutRequests] = useState([]);
  const [feeSettings, setFeeSettings] = useState({
    minimumFee: 5.0,
    feePercentage: 5.0,
    thresholdAmount1: 100.0,
    thresholdAmount2: 500.0,
    maximumFee: 50.0,
    transactionFeeFixed: 2.5,
    defaultAffiliateCommissionPercentage: 10.0,
  });
  const [feeSummary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [cashoutPagination, setCashoutPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [cashoutPage, setCashoutPage] = useState(1);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'cashouts') {
      fetchCashoutRequests();
    } else if (activeTab === 'fees') {
      fetchFeeSettings();
      fetchFeeSummary();
    }
  }, [activeTab, currentPage, cashoutPage]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTransactions(currentPage, 20);
      if (response.success) {
        setTransactions(response.transactions || []);
        setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setError(response.error || 'Failed to load transactions');
      }
    } catch (err) {
      setError('An error occurred while loading transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCashoutRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCashoutRequests(cashoutPage, 20);
      if (response.success) {
        setCashoutRequests(response.cashoutRequests || []);
        setCashoutPagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setError(response.error || 'Failed to load cashout requests');
      }
    } catch (err) {
      setError('An error occurred while loading cashout requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeSettings = async () => {
    try {
      const response = await getFeeSettings();
      if (response.success) {
        setFeeSettings(response);
      }
    } catch (err) {
      console.error('Error fetching fee settings:', err);
    }
  };

  const fetchFeeSummary = async () => {
    try {
      const response = await getFeeCollectionSummary();
      if (response.success) {
        setFeeSummary(response);
      }
    } catch (err) {
      console.error('Error fetching fee summary:', err);
    }
  };

  const handleAction = async (id, action, reason = null) => {
    setActionLoading(id);
    try {
      let response;
      if (action === 'approve_cashout') {
        response = await approveCashout(id);
      } else if (action === 'reject_cashout') {
        response = await rejectCashout(id, reason);
      }

      if (response?.success) {
        alert(`Cashout ${action === 'approve_cashout' ? 'approved' : 'rejected'} successfully`);
        fetchCashoutRequests();
      } else {
        alert(response?.error || `Failed to ${action} cashout`);
      }
    } catch (err) {
      alert(`An error occurred while ${action}ing cashout`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateFeeSettings = async () => {
    setLoading(true);
    try {
      const response = await updateFeeSettings(feeSettings);
      if (response.success) {
        setFeeSettings(response);
        alert('Fee settings updated successfully');
        fetchFeeSummary();
      } else {
        alert(response.error || 'Failed to update fee settings');
      }
    } catch (err) {
      alert('An error occurred while updating fee settings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-orange-100 text-orange-800',
      delivered: 'bg-cyan-100 text-cyan-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      approved: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      refunded: 'bg-pink-100 text-pink-800',
      failed: 'bg-red-200 text-red-900',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${colors[statusLower] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'Unknown'}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap">Transactions & Payments</h1>
        <p className="text-gray-600 text-sm sm:text-base whitespace-nowrap">Manage transactions, payments, and fee settings</p>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'transactions'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('cashouts')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'cashouts'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Cashout Requests
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'fees'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Fee Settings
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50 text-gray-900">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Type</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Buyer</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Seller</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Item</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Amount</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Dolabb Fee</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                        <td className="px-4 sm:px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold capitalize whitespace-nowrap">
                            {transaction.type?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{transaction.buyerName || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{transaction.SellerName || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{transaction.itemTitle || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                          SAR {(transaction.offerAmount || transaction.originalPrice || 0).toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-green-600 font-semibold whitespace-nowrap">
                          SAR {(transaction.dolabbFee || 0).toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4">{getStatusBadge(transaction.status)}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
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
        </motion.div>
      )}

      {/* Cashout Requests Tab */}
      {activeTab === 'cashouts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cashout requests...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 text-gray-900">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Seller</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Amount</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Account</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Requested Date</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cashoutRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                          No cashout requests found
                        </td>
                      </tr>
                    ) : (
                      cashoutRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                        <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{request.SellerName || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 font-semibold text-green-600 whitespace-nowrap">
                          SAR {(request.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {request.accountDetails ? `${request.accountDetails.bankName || ''} - ${request.accountDetails.accountNumber || ''}` : 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {request['Requested Date'] ? new Date(request['Requested Date']).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-4">{getStatusBadge(request.Status || request.status)}</td>
                        <td className="px-4 sm:px-6 py-4">
                          {(request.Status || request.status) === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(request._id || request.id, 'approve_cashout')}
                                disabled={actionLoading === (request._id || request.id)}
                                className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 whitespace-nowrap disabled:opacity-50"
                              >
                                {actionLoading === (request._id || request.id) ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason (optional):');
                                  handleAction(request._id || request.id, 'reject_cashout', reason);
                                }}
                                disabled={actionLoading === (request._id || request.id)}
                                className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 whitespace-nowrap disabled:opacity-50"
                              >
                                {actionLoading === (request._id || request.id) ? '...' : 'Reject'}
                              </button>
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
              {cashoutPagination.totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {cashoutPagination.currentPage} of {cashoutPagination.totalPages} ({cashoutPagination.totalItems} total)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCashoutPage(p => Math.max(1, p - 1))}
                      disabled={cashoutPage === 1}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCashoutPage(p => Math.min(cashoutPagination.totalPages, p + 1))}
                      disabled={cashoutPage === cashoutPagination.totalPages}
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
      )}

      {/* Fee Settings Tab */}
      {activeTab === 'fees' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6 border border-gray-200"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 whitespace-nowrap">Dolabb Fee Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                  Minimum Fee (SAR)
                </label>
                <input
                  type="number"
                  value={feeSettings.minimumFee || 0}
                  onChange={(e) => setFeeSettings({ ...feeSettings, minimumFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                  Fee Percentage (%)
                </label>
                <input
                  type="number"
                  value={feeSettings.feePercentage || 0}
                  onChange={(e) => setFeeSettings({ ...feeSettings, feePercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                  Maximum Fee (SAR)
                </label>
                <input
                  type="number"
                  value={feeSettings.maximumFee || 0}
                  onChange={(e) => setFeeSettings({ ...feeSettings, maximumFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                  Transaction Fee Fixed (SAR)
                </label>
                <input
                  type="number"
                  value={feeSettings.transactionFeeFixed || 0}
                  onChange={(e) => setFeeSettings({ ...feeSettings, transactionFeeFixed: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                  Default Affiliate Commission Percentage (%)
                </label>
                <input
                  type="number"
                  value={feeSettings.defaultAffiliateCommissionPercentage || 0}
                  onChange={(e) => setFeeSettings({ ...feeSettings, defaultAffiliateCommissionPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <button
                onClick={handleUpdateFeeSettings}
                disabled={loading}
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Fee Settings'}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 whitespace-nowrap">Fee Collection Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 whitespace-nowrap">Total Fees Collected</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 mt-2 whitespace-nowrap">
                  SAR {(feeSummary?.['Total Fees Collected'] || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 whitespace-nowrap">Total Transactions</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-2 whitespace-nowrap">
                  {(feeSummary?.['Total Transactions'] || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 whitespace-nowrap">Average Fee per Transaction</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-2 whitespace-nowrap">
                  SAR {(feeSummary?.['Average Fee per Transaction'] || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TransactionManagement;
