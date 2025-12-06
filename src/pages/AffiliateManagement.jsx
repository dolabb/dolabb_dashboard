import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FaEdit,
  FaCheck,
  FaTimes,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaDollarSign,
  FaPercent,
} from 'react-icons/fa';
import {
  getAllAffiliates,
  getAffiliatePayoutRequests,
  getAffiliateTransactions,
  updateAffiliateCommission,
  toggleAffiliateStatus,
  approveAffiliatePayout,
  rejectAffiliatePayout,
} from '../services/api';

const AffiliateManagement = () => {
  const [activeTab, setActiveTab] = useState('affiliates');
  const [affiliatesList, setAffiliatesList] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]);
  const [editingCommission, setEditingCommission] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [affiliateTransactions, setAffiliateTransactions] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutAction, setPayoutAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [affiliatePagination, setAffiliatePagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [payoutPagination, setPayoutPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [affiliatePage, setAffiliatePage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);

  useEffect(() => {
    if (activeTab === 'affiliates') {
      fetchAffiliates();
    } else if (activeTab === 'payouts') {
      fetchPayoutRequests();
    }
  }, [activeTab, affiliatePage, payoutPage]);

  const fetchAffiliates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllAffiliates(affiliatePage, 20);
      console.log('🔵 getAllAffiliates API Response:', response);
      console.log('🔵 getAllAffiliates - Full Response Data:', JSON.stringify(response, null, 2));
      if (response.success) {
        console.log('🔵 getAllAffiliates - Affiliates List:', response.affiliates);
        console.log('🔵 getAllAffiliates - Pagination:', response.pagination);
        setAffiliatesList(response.affiliates || []);
        setAffiliatePagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        console.error('🔴 getAllAffiliates - Error:', response.error);
        setError(response.error || 'Failed to load affiliates');
      }
    } catch (err) {
      console.error('🔴 getAllAffiliates - Exception:', err);
      setError('An error occurred while loading affiliates');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAffiliatePayoutRequests(payoutPage, 20);
      console.log('🟢 getAffiliatePayoutRequests API Response:', response);
      console.log('🟢 getAffiliatePayoutRequests - Full Response Data:', JSON.stringify(response, null, 2));
      if (response.success) {
        console.log('🟢 getAffiliatePayoutRequests - Payouts List:', response.payoutRequests);
        console.log('🟢 getAffiliatePayoutRequests - Pagination:', response.pagination);
        setPayoutsList(response.payoutRequests || []);
        setPayoutPagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        console.error('🔴 getAffiliatePayoutRequests - Error:', response.error);
        setError(response.error || 'Failed to load payout requests');
      }
    } catch (err) {
      console.error('🔴 getAffiliatePayoutRequests - Exception:', err);
      setError('An error occurred while loading payout requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateTransactions = async (affiliateId) => {
    try {
      const response = await getAffiliateTransactions(affiliateId, 1, 100);
      console.log('🟡 getAffiliateTransactions API Response:', response);
      console.log('🟡 getAffiliateTransactions - Affiliate ID:', affiliateId);
      console.log('🟡 getAffiliateTransactions - Full Response Data:', JSON.stringify(response, null, 2));
      if (response.success) {
        console.log('🟡 getAffiliateTransactions - Transactions List:', response.transactions);
        setAffiliateTransactions(response.transactions || []);
      } else {
        console.error('🔴 getAffiliateTransactions - Error:', response.error);
      }
    } catch (err) {
      console.error('🔴 getAffiliateTransactions - Exception:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(id);
    try {
      const affiliate = affiliatesList.find((a) => a.id === id || a._id === id);
      const currentStatus = affiliate?.Affiliatestatus || affiliate?.status;
      const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
      console.log('🟣 toggleAffiliateStatus - Request:', { id, newStatus, affiliate });
      const response = await toggleAffiliateStatus(id, newStatus);
      console.log('🟣 toggleAffiliateStatus API Response:', response);
      console.log('🟣 toggleAffiliateStatus - Full Response Data:', JSON.stringify(response, null, 2));
      if (response?.success) {
        console.log('✅ toggleAffiliateStatus - Success');
        alert(`Affiliate ${affiliate?.Affiliatename || affiliate?.name || 'has been'} ${newStatus === 'active' ? 'reactivated' : 'deactivated'}`);
        fetchAffiliates();
      } else {
        console.error('🔴 toggleAffiliateStatus - Error:', response?.error);
        alert(response?.error || 'Failed to update affiliate status');
      }
    } catch (err) {
      console.error('🔴 toggleAffiliateStatus - Exception:', err);
      alert('An error occurred while updating affiliate status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditCommission = (affiliate) => {
    setEditingCommission(affiliate.id || affiliate._id);
    setNewCommissionRate((affiliate.commissionRate || 0).toString());
  };

  const handleSaveCommission = async (id) => {
    const rate = parseFloat(newCommissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Please enter a valid commission rate between 0 and 100');
      return;
    }

    setActionLoading(id);
    try {
      console.log('🟠 updateAffiliateCommission - Request:', { id, commissionRate: rate });
      const response = await updateAffiliateCommission(id, rate);
      console.log('🟠 updateAffiliateCommission API Response:', response);
      console.log('🟠 updateAffiliateCommission - Full Response Data:', JSON.stringify(response, null, 2));
      if (response?.success) {
        console.log('✅ updateAffiliateCommission - Success');
        setEditingCommission(null);
        setNewCommissionRate('');
        alert('Commission rate updated successfully!');
        fetchAffiliates();
      } else {
        console.error('🔴 updateAffiliateCommission - Error:', response?.error);
        alert(response?.error || 'Failed to update commission rate');
      }
    } catch (err) {
      console.error('🔴 updateAffiliateCommission - Exception:', err);
      alert('An error occurred while updating commission rate');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommission(null);
    setNewCommissionRate('');
  };

  const handleViewTransactions = async (affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowTransactionModal(true);
    await fetchAffiliateTransactions(affiliate.id || affiliate._id);
  };

  const handleApprovePayout = (payout) => {
    setSelectedPayout(payout);
    setPayoutAction('approve');
    setShowPayoutModal(true);
  };

  const handleRejectPayout = (payout) => {
    setSelectedPayout(payout);
    setPayoutAction('reject');
    setRejectionReason('');
    setShowPayoutModal(true);
  };

  const confirmPayoutAction = async () => {
    if (!selectedPayout) return;

    if (payoutAction === 'reject' && !rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    setActionLoading(selectedPayout.id || selectedPayout._id);
    try {
      let response;
      const payoutId = selectedPayout.id || selectedPayout._id;
      
      if (payoutAction === 'approve') {
        console.log('🟦 approveAffiliatePayout - Request:', { payoutId, payout: selectedPayout });
        response = await approveAffiliatePayout(payoutId);
        console.log('🟦 approveAffiliatePayout API Response:', response);
        console.log('🟦 approveAffiliatePayout - Full Response Data:', JSON.stringify(response, null, 2));
      } else {
        console.log('🔴 rejectAffiliatePayout - Request:', { payoutId, reason: rejectionReason.trim(), payout: selectedPayout });
        response = await rejectAffiliatePayout(payoutId, rejectionReason.trim());
        console.log('🔴 rejectAffiliatePayout API Response:', response);
        console.log('🔴 rejectAffiliatePayout - Full Response Data:', JSON.stringify(response, null, 2));
      }

      if (response?.success) {
        console.log(`✅ ${payoutAction === 'approve' ? 'approveAffiliatePayout' : 'rejectAffiliatePayout'} - Success`);
        alert(`Payout of SAR ${(selectedPayout.amount || 0).toLocaleString()} ${payoutAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
        setShowPayoutModal(false);
        setSelectedPayout(null);
        setPayoutAction('');
        setRejectionReason('');
        fetchPayoutRequests();
      } else {
        console.error(`🔴 ${payoutAction === 'approve' ? 'approveAffiliatePayout' : 'rejectAffiliatePayout'} - Error:`, response?.error);
        alert(response?.error || `Failed to ${payoutAction} payout`);
      }
    } catch (err) {
      console.error(`🔴 ${payoutAction === 'approve' ? 'approveAffiliatePayout' : 'rejectAffiliatePayout'} - Exception:`, err);
      alert(`An error occurred while ${payoutAction}ing payout`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      status = 'unknown';
    }
    const statusLower = status.toLowerCase();
    const styles = {
      active: 'bg-green-100 text-green-800',
      deactivated: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${
          styles[statusLower] || 'bg-gray-100 text-gray-800'
        }`}
      >
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap">
          Affiliate Management
        </h1>
        <p className="text-gray-600 text-sm sm:text-base whitespace-nowrap">
          Manage affiliates, payouts, commissions, and track transactions
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'affiliates'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            All Affiliates
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 sm:px-4 py-2 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'payouts'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Payout Requests
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Affiliates Tab */}
      {activeTab === 'affiliates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading affiliates...</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                  All Affiliates & Activity
                </h2>
              </div>
              <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Affiliate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Commission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Referrals
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Total Sales
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Earnings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Last Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affiliatesList.map((affiliate, index) => (
                  <motion.tr
                    key={affiliate.id || affiliate._id || `affiliate-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {affiliate.Affiliatename || affiliate.name || affiliate.affiliateName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{affiliate.Affiliateemail || affiliate.email || 'N/A'}</div>
                        <div className="text-xs text-gray-400">
                          Code: {affiliate.affiliateCode || affiliate.referralCode || affiliate.code || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(affiliate.Affiliatestatus || affiliate.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingCommission === (affiliate.id || affiliate._id) ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newCommissionRate}
                            onChange={(e) => setNewCommissionRate(e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={actionLoading === (affiliate.id || affiliate._id)}
                          />
                          <span className="text-sm text-gray-600">%</span>
                          <button
                            onClick={() => handleSaveCommission(affiliate.id || affiliate._id)}
                            className="text-green-600 hover:text-green-700"
                            disabled={actionLoading === (affiliate.id || affiliate._id)}
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-700"
                            disabled={actionLoading === (affiliate.id || affiliate._id)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {affiliate.commissionRate || affiliate.commission || 0}%
                          </span>
                          <button
                            onClick={() => handleEditCommission(affiliate)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit Commission"
                            disabled={actionLoading === (affiliate.id || affiliate._id)}
                          >
                            <FaEdit className="text-xs" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {affiliate.stats?.totalReferrals || affiliate.totalReferrals || affiliate.referrals || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      SAR {((affiliate.stats?.totalEarnings || affiliate.totalEarnings || affiliate.sales || 0)).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Total: SAR {((affiliate.Earnings?.Total || affiliate.stats?.totalEarnings || affiliate.totalEarnings || affiliate.earnings || 0)).toLocaleString()}
                        </div>
                        <div className="text-yellow-600">
                          Pending: SAR {((affiliate.Earnings?.Pending || affiliate.pendingEarnings || affiliate.pending || 0)).toLocaleString()}
                        </div>
                        <div className="text-green-600">
                          Paid: SAR {((affiliate.Earnings?.Paid || affiliate.paidEarnings || affiliate.paid || 0)).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {affiliate['Last Activity'] ? new Date(affiliate['Last Activity']).toLocaleDateString() : (affiliate.lastActivity ? new Date(affiliate.lastActivity).toLocaleDateString() : (affiliate.lastActivityDate || 'N/A'))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewTransactions(affiliate)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <FaEye /> View Transactions
                        </button>
                        <button
                          onClick={() => handleToggleStatus(affiliate.id || affiliate._id)}
                          disabled={actionLoading === (affiliate.id || affiliate._id)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1 disabled:opacity-50 ${
                            (affiliate.Affiliatestatus || affiliate.status) === 'active'
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {(affiliate.Affiliatestatus || affiliate.status) === 'active' ? (
                            <>
                              <FaToggleOff /> Deactivate
                            </>
                          ) : (
                            <>
                              <FaToggleOn /> Reactivate
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {affiliatePagination.totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {affiliatePagination.currentPage} of {affiliatePagination.totalPages} ({affiliatePagination.totalItems} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAffiliatePage(p => Math.max(1, p - 1))}
                  disabled={affiliatePage === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setAffiliatePage(p => Math.min(affiliatePagination.totalPages, p + 1))}
                  disabled={affiliatePage === affiliatePagination.totalPages}
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

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payout requests...</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                  Payout Requests
                </h2>
              </div>
              <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Affiliate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Request Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Account Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payoutsList.map((payout, index) => (
                  <motion.tr
                    key={payout.id || payout._id || `payout-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payout.affiliateName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {payout.affiliateId || payout.affiliate || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        SAR {(payout.amount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payout['Requested Date'] ? new Date(payout['Requested Date']).toLocaleDateString() : (payout.requestedDate ? new Date(payout.requestedDate).toLocaleDateString() : 'N/A')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payout['Payment Method'] || payout.paymentMethod || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payout.accountDetails ? (typeof payout.accountDetails === 'string' ? payout.accountDetails : `${payout.accountDetails.bankName || ''} - ${payout.accountDetails.accountNumber || ''}`) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(payout.Status || payout.status)}
                      {payout.approvedDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Approved: {new Date(payout.approvedDate).toLocaleDateString()}
                        </div>
                      )}
                      {payout.rejectionReason && (
                        <div className="text-xs text-red-500 mt-1">
                          Reason: {payout.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {(payout.Status || payout.status) === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePayout(payout)}
                            disabled={actionLoading === (payout.id || payout._id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition-colors whitespace-nowrap flex items-center gap-1 disabled:opacity-50"
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectPayout(payout)}
                            disabled={actionLoading === (payout.id || payout._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors whitespace-nowrap flex items-center gap-1 disabled:opacity-50"
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      )}
                      {(payout.status || payout.Status) === 'approved' && (
                        <span className="text-sm text-green-600 font-semibold">
                          Approved
                        </span>
                      )}
                      {(payout.Status || payout.status) === 'rejected' && (
                        <span className="text-sm text-red-600 font-semibold">
                          Rejected
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {payoutPagination.totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {payoutPagination.currentPage} of {payoutPagination.totalPages} ({payoutPagination.totalItems} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPayoutPage(p => Math.max(1, p - 1))}
                  disabled={payoutPage === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPayoutPage(p => Math.min(payoutPagination.totalPages, p + 1))}
                  disabled={payoutPage === payoutPagination.totalPages}
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

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && selectedAffiliate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTransactionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-4 sm:p-6 max-w-4xl w-full mx-4 border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  Transactions for {selectedAffiliate.Affiliatename || selectedAffiliate.name || selectedAffiliate.affiliateName || 'N/A'}
                </h2>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Referrals:</span>
                    <span className="font-semibold ml-2">
                      {selectedAffiliate.stats?.totalReferrals || selectedAffiliate.totalReferrals || selectedAffiliate.referrals || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-semibold ml-2">
                      {selectedAffiliate.stats?.['Total Sales'] || selectedAffiliate.stats?.totalSales || selectedAffiliate.stats?.TotalSales || selectedAffiliate.totalSales || selectedAffiliate.sales || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Commission Rate:</span>
                    <span className="font-semibold ml-2">
                      {selectedAffiliate.stats?.['Commission Rate'] || selectedAffiliate.stats?.commissionRate || selectedAffiliate.commissionRate || selectedAffiliate.commission || 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Earnings:</span>
                    <span className="font-semibold ml-2">
                      SAR {((selectedAffiliate.Earnings?.Total || selectedAffiliate.stats?.totalEarnings || selectedAffiliate.totalEarnings || selectedAffiliate.earnings || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Referred User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Sale Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Commission
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {affiliateTransactions.length > 0 ? (
                      affiliateTransactions.map((transaction, index) => (
                        <tr key={transaction._id || transaction['Transaction ID'] || transaction.id || transaction.transactionId || `transaction-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction['Transaction ID'] || transaction.TransactionID || transaction.transactionId || transaction.id || transaction._id || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction['Referred User Name'] || transaction.ReferredUserName || transaction.referredUser || transaction.userName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            SAR {((transaction.stats?.['Total Sales'] || transaction.stats?.totalSales || transaction.amount || transaction.saleAmount || 0)).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            SAR {((transaction['Referred User Commission'] || transaction.ReferredUserCommission || transaction.commission || 0)).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(transaction.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout Action Modal */}
      <AnimatePresence>
        {showPayoutModal && selectedPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 whitespace-nowrap">
                {payoutAction === 'approve' ? 'Approve' : 'Reject'} Payout
              </h2>
              <div className="space-y-3 mb-6">
                <p className="text-gray-700">
                  <strong className="font-semibold">Affiliate:</strong>{' '}
                  {selectedPayout.affiliateName || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold">Amount:</strong> $
                  {(selectedPayout.amount || 0).toLocaleString()}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold">Payment Method:</strong>{' '}
                  {selectedPayout['Payment Method'] || selectedPayout.paymentMethod || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold">Account:</strong>{' '}
                  {selectedPayout.accountDetails || 'N/A'}
                </p>
                {selectedPayout.transactions && selectedPayout.transactions.length > 0 && (
                  <p className="text-gray-700">
                    <strong className="font-semibold">Transactions:</strong>{' '}
                    {Array.isArray(selectedPayout.transactions) ? selectedPayout.transactions.join(', ') : 'N/A'}
                  </p>
                )}
                {payoutAction === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      rows="3"
                      placeholder="Enter rejection reason..."
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayoutAction}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    payoutAction === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {payoutAction === 'approve' ? (
                    <>
                      <FaCheck /> Approve
                    </>
                  ) : (
                    <>
                      <FaTimes /> Reject
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AffiliateManagement;

