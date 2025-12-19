import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  getDisputes,
  updateDispute,
  closeDispute,
} from '../services/api';

const DisputeManagement = () => {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filter, setFilter] = useState('all');
  const [disputes, setDisputes] = useState([]);
  const [adminNote, setAdminNote] = useState('');
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, [currentPage, filter]);

  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'all' ? null : filter;
      const response = await getDisputes(currentPage, 20, status);
      if (response.success) {
        setDisputes(response.disputes || []);
        setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setError(response.error || 'Failed to load disputes');
      }
    } catch (err) {
      setError('An error occurred while loading disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (disputeId, action) => {
    if (action === 'resolve' || action === 'mark_resolved') {
      setSelectedDispute(disputes.find(d => (d._id || d.id) === disputeId));
      return;
    }
  };

  const saveDisputeUpdate = async () => {
    if (!selectedDispute) return;

    setActionLoading(selectedDispute._id || selectedDispute.id);
    try {
      const updateData = {};
      if (adminNote) updateData.adminNotes = adminNote;
      if (resolution) updateData.resolution = resolution;
      if (selectedDispute.status !== 'resolved') {
        updateData.status = 'resolved';
      }

      const response = await updateDispute(selectedDispute._id || selectedDispute.id, updateData);
      if (response.success) {
        alert('Dispute updated successfully');
        setSelectedDispute(null);
        setAdminNote('');
        setResolution('');
        fetchDisputes();
      } else {
        alert(response.error || 'Failed to update dispute');
      }
    } catch (err) {
      alert('An error occurred while updating dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseDispute = async () => {
    if (!selectedDispute) return;

    setActionLoading(selectedDispute._id || selectedDispute.id);
    try {
      const response = await closeDispute(selectedDispute._id || selectedDispute.id, resolution || undefined);
      if (response.success) {
        alert('Dispute closed successfully');
        setSelectedDispute(null);
        setAdminNote('');
        setResolution('');
        fetchDisputes();
      } else {
        alert(response.error || 'Failed to close dispute');
      }
    } catch (err) {
      alert('An error occurred while closing dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors[status] || colors.open}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      product_quality: 'bg-red-100 text-red-800',
      delivery_issue: 'bg-orange-100 text-orange-800',
      payment_dispute: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors[type] || colors.product_quality}`}>
        {type.replace('_', ' ')}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap">Disputes & Complaints</h1>
        <p className="text-gray-600 text-sm sm:text-base whitespace-nowrap">Manage user complaints and disputes</p>
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
            All Disputes
          </button>
          <button
            onClick={() => { setFilter('open'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'open' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => { setFilter('resolved'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading disputes...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 text-gray-900">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Case Number</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Type</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Buyer</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Seller</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Item</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {disputes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                        No disputes found
                      </td>
                    </tr>
                  ) : (
                    disputes.map((dispute, index) => (
                <motion.tr
                  key={dispute.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setAdminNote(dispute.adminNotes || '');
                    setResolution(dispute.resolution || '');
                  }}
                >
                      <td className="px-4 sm:px-6 py-4 font-semibold text-blue-600 whitespace-nowrap">{dispute.caseNumber || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-4">{getTypeBadge(dispute.type || 'item_not_received')}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{dispute.buyerName || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{dispute.SellerName || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{dispute.itemTitle || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-4">{getStatusBadge(dispute.status || 'open')}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex gap-2">
                          {dispute.status === 'open' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(dispute._id || dispute.id, 'resolve'); }}
                              className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 whitespace-nowrap"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
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

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDispute(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-4 sm:p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 whitespace-nowrap">
              {selectedDispute.caseNumber}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 whitespace-nowrap">Type</p>
                  <p className="font-semibold mt-1">{getTypeBadge(selectedDispute.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 whitespace-nowrap">Status</p>
                  <p className="mt-1">{getStatusBadge(selectedDispute.status)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Buyer Name</p>
                <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedDispute.buyerName || selectedDispute.buyer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Seller Name</p>
                <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedDispute.SellerName || selectedDispute.seller || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Order ID</p>
                <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedDispute.orderId || selectedDispute.order_id || selectedDispute.orderID || selectedDispute.order || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 whitespace-nowrap">Item Title</p>
                <p className="font-semibold text-gray-900 whitespace-nowrap">{selectedDispute.itemTitle || selectedDispute.item || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Item Description</p>
                <p className="bg-gray-50 p-3 rounded text-gray-700 border border-gray-200">{selectedDispute.itemDescription || selectedDispute.item_description || selectedDispute.itemDesc || selectedDispute.description || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Dispute Description</p>
                <p className="bg-gray-50 p-3 rounded text-gray-700 border border-gray-200">{selectedDispute.description || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                  Admin Notes
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  rows="4"
                  placeholder="Add admin notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
                  Resolution Outcome
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  rows="3"
                  placeholder="Enter resolution outcome..."
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4 flex-wrap">
              <button
                onClick={saveDisputeUpdate}
                disabled={actionLoading === (selectedDispute._id || selectedDispute.id)}
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-sm sm:text-base disabled:opacity-50"
              >
                {actionLoading === (selectedDispute._id || selectedDispute.id) ? 'Saving...' : 'Save Updates'}
              </button>
              <button
                onClick={handleCloseDispute}
                disabled={actionLoading === (selectedDispute._id || selectedDispute.id)}
                className="px-4 sm:px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap text-sm sm:text-base disabled:opacity-50"
              >
                {actionLoading === (selectedDispute._id || selectedDispute.id) ? 'Closing...' : 'Close Dispute'}
              </button>
              <button
                onClick={() => setSelectedDispute(null)}
                className="px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors whitespace-nowrap text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DisputeManagement;
