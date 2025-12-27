import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaComment,
  FaDownload,
  FaFileAlt,
  FaImage,
  FaPaperclip,
  FaSearch,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useToast } from '../components/Toast';
import {
  addDisputeComment,
  closeDispute,
  getDisputeDetails,
  getDisputes,
  updateDispute,
  uploadDisputeEvidence,
} from '../services/api';

const DisputeManagement = () => {
  const { success, error: showError } = useToast();
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [disputeDetails, setDisputeDetails] = useState(null);
  const [filter, setFilter] = useState('all');
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  // Form states
  const [adminNote, setAdminNote] = useState('');
  const [resolution, setResolution] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        console.log('=== ALL DISPUTES RESPONSE ===');
        console.log('Full response:', response);
        console.log('Disputes array:', response.disputes);
        if (response.disputes && response.disputes.length > 0) {
          console.log('First dispute sample:', response.disputes[0]);
          console.log('First dispute keys:', Object.keys(response.disputes[0]));
        }
        console.log('============================');
        setDisputes(response.disputes || []);
        setPagination(
          response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          }
        );
      } else {
        setError(response.error || 'Failed to load disputes');
        showError(response.error || 'Failed to load disputes');
      }
    } catch (err) {
      const errorMsg = 'An error occurred while loading disputes';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputeDetails = async disputeId => {
    setDetailsLoading(true);
    try {
      const response = await getDisputeDetails(disputeId);
      if (response.success) {
        console.log('=== DISPUTE DETAILS RESPONSE ===');
        console.log('Full response:', response);
        console.log('Dispute object:', response.dispute);
        console.log('Dispute keys:', Object.keys(response.dispute));
        console.log('Order info:', {
          'orderId (top level)': response.dispute.orderId,
          'orderNumber (top level)': response.dispute.orderNumber,
          'order': response.dispute.order,
          'order_id': response.dispute.order_id,
          'order?._id': response.dispute.order?._id,
          'order?.id': response.dispute.order?.id,
          'order?.orderNumber': response.dispute.order?.orderNumber,
        });
        console.log('Selected dispute:', selectedDispute);
        console.log('================================');
        setDisputeDetails(response.dispute);
        setAdminNote(response.dispute.adminNotes || '');
        setResolution(response.dispute.resolution || '');
        setStatusUpdate(response.dispute.status || '');
      } else {
        showError(response.error || 'Failed to load dispute details');
      }
    } catch (err) {
      showError('An error occurred while loading dispute details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDisputeClick = async dispute => {
    console.log('=== DISPUTE CLICKED ===');
    console.log('Clicked dispute object:', dispute);
    console.log('Dispute keys:', Object.keys(dispute));
    console.log('Dispute ID:', dispute._id || dispute.id);
    console.log('Order info in clicked dispute:', {
      'orderId': dispute.orderId,
      'order': dispute.order,
      'order?.id': dispute.order?.id,
    });
    console.log('======================');
    setSelectedDispute(dispute);
    await fetchDisputeDetails(dispute._id || dispute.id);
  };

  const handleAddComment = async () => {
    if (!commentMessage.trim() || !selectedDispute) return;

    setCommentLoading(true);
    try {
      const disputeId = selectedDispute._id || selectedDispute.id;
      
      // Comprehensive logging of dispute data
      console.log('=== ADDING COMMENT - FULL DEBUG ===');
      console.log('1. Selected Dispute (full object):', JSON.stringify(selectedDispute, null, 2));
      console.log('2. Selected Dispute keys:', Object.keys(selectedDispute || {}));
      console.log('3. Dispute Details (full object):', JSON.stringify(disputeDetails, null, 2));
      console.log('4. Dispute Details keys:', Object.keys(disputeDetails || {}));
      
      // Check all possible order ID paths
      const orderIdChecks = {
        'disputeDetails?.orderId': disputeDetails?.orderId,
        'disputeDetails?.order_id': disputeDetails?.order_id,
        'disputeDetails?.order?._id': disputeDetails?.order?._id,
        'disputeDetails?.order?.id': disputeDetails?.order?.id,
        'disputeDetails?.order?.orderId': disputeDetails?.order?.orderId,
        'disputeDetails?.order?.order_id': disputeDetails?.order?.order_id,
        'selectedDispute?.orderId': selectedDispute?.orderId,
        'selectedDispute?.order_id': selectedDispute?.order_id,
        'selectedDispute?.order?._id': selectedDispute?.order?._id,
        'selectedDispute?.order?.id': selectedDispute?.order?.id,
        'selectedDispute?.order?.orderId': selectedDispute?.order?.orderId,
        'selectedDispute?.order?.order_id': selectedDispute?.order?.order_id,
      };
      
      console.log('5. Order ID extraction attempts:', orderIdChecks);
      
      // Extract order_id from disputeDetails or selectedDispute
      // Priority: order_id (snake_case) > orderId (camelCase) > order._id > order.id
      // The backend expects order_id to match the dispute's order_id field
      const orderId =
        disputeDetails?.order_id ||
        disputeDetails?.orderId ||
        selectedDispute?.order_id ||
        selectedDispute?.orderId ||
        disputeDetails?.order?._id ||
        disputeDetails?.order?.id ||
        selectedDispute?.order?._id ||
        selectedDispute?.order?.id;
      
      console.log('6. Final extracted orderId:', orderId);
      console.log('7. OrderId type:', typeof orderId);
      console.log('8. OrderId is null?', orderId === null);
      console.log('9. OrderId is undefined?', orderId === undefined);
      console.log('10. OrderId is falsy?', !orderId);
      
      // Log order object structure if it exists
      if (disputeDetails?.order) {
        console.log('11. disputeDetails.order (full):', JSON.stringify(disputeDetails.order, null, 2));
        console.log('12. disputeDetails.order keys:', Object.keys(disputeDetails.order));
      }
      if (selectedDispute?.order) {
        console.log('13. selectedDispute.order (full):', JSON.stringify(selectedDispute.order, null, 2));
        console.log('14. selectedDispute.order keys:', Object.keys(selectedDispute.order));
      }
      
      console.log('=====================================');
      
      if (!orderId) {
        console.error('❌ ORDER ID IS MISSING - Cannot proceed with comment');
        showError('Order ID is missing. Please refresh the dispute details.');
        setCommentLoading(false);
        return;
      }

      // Ensure order_id is a string (not ObjectId or other type)
      const orderIdString = String(orderId).trim();
      
      if (!orderIdString || orderIdString === 'null' || orderIdString === 'undefined') {
        console.error('❌ ORDER ID IS INVALID - Cannot proceed with comment');
        showError('Order ID is invalid. Please refresh the dispute details.');
        setCommentLoading(false);
        return;
      }

      // Log API endpoint and payload before making the request
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dolabb-backend-2vsj.onrender.com';
      const apiEndpoint = `${API_BASE_URL}/api/admin/disputes/${disputeId}/comments/`;
      const apiPayload = {
        message: commentMessage.trim(),
        order_id: orderIdString,
      };
      
      console.log('=== ADD COMMENT API REQUEST ===');
      console.log('API Endpoint:', apiEndpoint);
      console.log('API Method: POST');
      console.log('Dispute ID:', disputeId);
      console.log('Comment Message:', commentMessage);
      console.log('Order ID (being sent):', orderId);
      console.log('Order ID type:', typeof orderId);
      console.log('Full Payload Object:', apiPayload);
      console.log('Full Payload (JSON):', JSON.stringify(apiPayload, null, 2));
      console.log('Payload keys:', Object.keys(apiPayload));
      console.log('Payload.order_id value:', apiPayload.order_id);
      console.log('Payload.order_id is null?', apiPayload.order_id === null);
      console.log('Payload.order_id is undefined?', apiPayload.order_id === undefined);
      console.log('================================');

      const response = await addDisputeComment(disputeId, commentMessage, orderIdString);
      
      console.log('=== ADD COMMENT API RESPONSE ===');
      console.log('Response:', response);
      console.log('Response Success:', response.success);
      if (!response.success) {
        console.log('Response Error:', response.error);
      }
      console.log('=================================');
      
      if (response.success) {
        success(
          'Comment added successfully. Buyer will be notified via email.'
        );
        setCommentMessage('');
        // Refresh dispute details to get updated messages
        await fetchDisputeDetails(disputeId);
      } else {
        showError(response.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('=== ADD COMMENT API ERROR ===');
      console.error('Error:', err);
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);
      console.error('============================');
      showError('An error occurred while adding comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedDispute) return;

    setActionLoading('update');
    try {
      const disputeId = selectedDispute._id || selectedDispute.id;
      // Extract order_id from disputeDetails or selectedDispute
      // API returns orderId directly on the dispute object
      const orderId =
        disputeDetails?.orderId ||
        selectedDispute?.orderId ||
        disputeDetails?.order?._id ||
        disputeDetails?.order?.id ||
        disputeDetails?.order_id ||
        selectedDispute?.order?._id ||
        selectedDispute?.order?.id ||
        selectedDispute?.order_id;
      
      if (!orderId) {
        showError('Order ID is missing. Please refresh the dispute details.');
        setActionLoading(null);
        return;
      }

      const updateData = { order_id: orderId };
      if (statusUpdate) updateData.status = statusUpdate;

      const response = await updateDispute(disputeId, updateData);
      if (response.success) {
        success('Dispute updated successfully');
        if (statusUpdate === 'resolved') {
          success('Buyer and seller have been notified');
        }
        await fetchDisputeDetails(disputeId);
        fetchDisputes();
      } else {
        showError(response.error || 'Failed to update dispute');
      }
    } catch (err) {
      showError('An error occurred while updating dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseDispute = async () => {
    if (!selectedDispute) {
      showError('Please select a dispute');
      return;
    }

    setActionLoading('close');
    try {
      const disputeId = selectedDispute._id || selectedDispute.id;
      // Extract order_id from disputeDetails or selectedDispute
      // API returns orderId directly on the dispute object
      const orderId =
        disputeDetails?.orderId ||
        selectedDispute?.orderId ||
        disputeDetails?.order?._id ||
        disputeDetails?.order?.id ||
        disputeDetails?.order_id ||
        selectedDispute?.order?._id ||
        selectedDispute?.order?.id ||
        selectedDispute?.order_id;
      
      if (!orderId) {
        showError('Order ID is missing. Please refresh the dispute details.');
        setActionLoading(null);
        return;
      }

      const response = await closeDispute(disputeId, null, orderId);
      if (response.success) {
        success('Dispute closed successfully');
        await fetchDisputeDetails(disputeId);
        fetchDisputes();
      } else {
        showError(response.error || 'Failed to close dispute');
      }
    } catch (err) {
      showError('An error occurred while closing dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadEvidence = async () => {
    if (!evidenceFile || !selectedDispute) return;

    setUploadingEvidence(true);
    try {
      const disputeId = selectedDispute._id || selectedDispute.id;
      const response = await uploadDisputeEvidence(
        disputeId,
        evidenceFile,
        evidenceDescription || null
      );
      if (response.success) {
        success('Evidence uploaded successfully');
        setEvidenceFile(null);
        setEvidenceDescription('');
        await fetchDisputeDetails(disputeId);
      } else {
        showError(response.error || 'Failed to upload evidence');
      }
    } catch (err) {
      showError('An error occurred while uploading evidence');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const getStatusBadge = status => {
    const config = {
      open: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <FaClock className='w-3 h-3' />,
      },
      resolved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <FaCheckCircle className='w-3 h-3' />,
      },
      closed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <FaTimes className='w-3 h-3' />,
      },
    };
    const style = config[status] || config.open;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
      >
        {style.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = type => {
    const config = {
      product_quality: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Product Quality',
      },
      delivery_issue: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Delivery Issue',
      },
      payment_dispute: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Payment Dispute',
      },
    };
    const style = config[type] || config.product_quality;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
      >
        {style.label || type.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (dispute.caseNumber || '').toLowerCase().includes(query) ||
      (dispute.buyerName || '').toLowerCase().includes(query) ||
      (dispute.SellerName || '').toLowerCase().includes(query) ||
      (dispute.itemTitle || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Dispute Management
        </h1>
        <p className='text-gray-600'>Manage and resolve customer disputes</p>
      </motion.div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1 relative'>
            <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search by case number, buyer, seller, or item...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            />
          </div>

          {/* Status Filters */}
          <div className='flex gap-2 flex-wrap'>
            {['all', 'open', 'resolved', 'closed'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all'
                  ? 'All'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='p-12 text-center'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading disputes...</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Case Number
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Type
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Buyer
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Seller
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Item
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Created
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredDisputes.length === 0 ? (
                    <tr>
                      <td
                        colSpan='8'
                        className='px-6 py-12 text-center text-gray-500'
                      >
                        <FaFileAlt className='mx-auto text-4xl text-gray-300 mb-3' />
                        <p className='text-lg font-medium'>No disputes found</p>
                        <p className='text-sm'>
                          Try adjusting your filters or search query
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDisputes.map((dispute, index) => (
                      <motion.tr
                        key={dispute._id || dispute.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className='hover:bg-gray-50 cursor-pointer transition-colors'
                        onClick={() => handleDisputeClick(dispute)}
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='font-semibold text-blue-600'>
                            {dispute.caseNumber || 'N/A'}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {getTypeBadge(dispute.type || dispute.disputeType)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center gap-2'>
                            <FaUser className='text-gray-400' />
                            <span className='text-sm text-gray-900'>
                              {dispute.buyerName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center gap-2'>
                            <FaUser className='text-gray-400' />
                            <span className='text-sm text-gray-900'>
                              {dispute.SellerName ||
                                dispute.sellerName ||
                                'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <FaBox className='text-gray-400' />
                            <span className='text-sm text-gray-900 truncate max-w-xs'>
                              {dispute.itemTitle || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {getStatusBadge(dispute.status || 'open')}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                          {formatDate(dispute.createdAt || dispute.created_at)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDisputeClick(dispute);
                            }}
                            className='px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors'
                          >
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className='px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between'>
                <div className='text-sm text-gray-700'>
                  Showing page {pagination.currentPage} of{' '}
                  {pagination.totalPages} ({pagination.totalItems} total)
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(p =>
                        Math.min(pagination.totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
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
      <AnimatePresence>
        {selectedDispute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'
            onClick={() => {
              setSelectedDispute(null);
              setDisputeDetails(null);
              setCommentMessage('');
              setEvidenceFile(null);
              setEvidenceDescription('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className='bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col'
            >
              {/* Modal Header */}
              <div className='px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    {disputeDetails?.caseNumber ||
                      selectedDispute?.caseNumber ||
                      'Dispute Details'}
                  </h2>
                  {disputeDetails && (
                    <p className='text-sm text-gray-600 mt-1'>
                      Created{' '}
                      {formatDate(
                        disputeDetails.created_at || disputeDetails.createdAt
                      )}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedDispute(null);
                    setDisputeDetails(null);
                    setCommentMessage('');
                    setEvidenceFile(null);
                    setEvidenceDescription('');
                  }}
                  className='p-2 hover:bg-gray-200 rounded-lg transition-colors'
                >
                  <FaTimes className='w-5 h-5 text-gray-500' />
                </button>
              </div>

              {/* Modal Content */}
              <div className='flex-1 overflow-y-auto p-6'>
                {detailsLoading ? (
                  <div className='flex items-center justify-center py-12'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'></div>
                  </div>
                ) : disputeDetails ? (
                  <div className='space-y-6'>
                    {/* Dispute Info Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                        <p className='text-xs text-gray-600 uppercase tracking-wide mb-1'>
                          Type
                        </p>
                        <div className='mt-1'>
                          {getTypeBadge(
                            disputeDetails.type || disputeDetails.disputeType
                          )}
                        </div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                        <p className='text-xs text-gray-600 uppercase tracking-wide mb-1'>
                          Status
                        </p>
                        <div className='mt-1'>
                          {getStatusBadge(disputeDetails.status)}
                        </div>
                      </div>
                    </div>

                    {/* Parties Information */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
                        <p className='text-xs text-blue-600 uppercase tracking-wide mb-2 font-semibold'>
                          Buyer
                        </p>
                        <p className='font-semibold text-gray-900'>
                          {disputeDetails.buyer?.name ||
                            disputeDetails.buyerName ||
                            'N/A'}
                        </p>
                        <p className='text-sm text-gray-600 mt-1'>
                          {disputeDetails.buyer?.email || 'N/A'}
                        </p>
                      </div>
                      <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
                        <p className='text-xs text-purple-600 uppercase tracking-wide mb-2 font-semibold'>
                          Seller
                        </p>
                        <p className='font-semibold text-gray-900'>
                          {disputeDetails.seller?.name ||
                            disputeDetails.SellerName ||
                            disputeDetails.sellerName ||
                            'N/A'}
                        </p>
                        <p className='text-sm text-gray-600 mt-1'>
                          {disputeDetails.seller?.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Order & Item Information */}
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <p className='text-xs text-gray-600 uppercase tracking-wide mb-3 font-semibold'>
                        Order & Item Details
                      </p>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <p className='text-sm text-gray-600 mb-1'>Order ID</p>
                          <p className='font-semibold text-gray-900'>
                            {disputeDetails.order?._id ||
                              disputeDetails.order?.id ||
                              disputeDetails.orderId ||
                              disputeDetails.order_id ||
                              disputeDetails.order?.orderNumber ||
                              'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600 mb-1'>Item</p>
                          <p className='font-semibold text-gray-900'>
                            {disputeDetails.item?.title ||
                              disputeDetails.itemTitle ||
                              'N/A'}
                          </p>
                          {disputeDetails.item?.price && (
                            <p className='text-sm text-gray-600 mt-1'>
                              ${disputeDetails.item.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <p className='text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold'>
                        Dispute Description
                      </p>
                      <p className='text-gray-900 whitespace-pre-wrap'>
                        {disputeDetails.description || 'N/A'}
                      </p>
                    </div>

                    {/* Evidence */}
                    {disputeDetails.evidence &&
                      disputeDetails.evidence.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                          <p className='text-xs text-gray-600 uppercase tracking-wide mb-4 font-semibold'>
                            Evidence ({disputeDetails.evidence.length})
                          </p>
                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {disputeDetails.evidence.map((evidence, idx) => (
                              <div
                                key={evidence.id || idx}
                                className='bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow'
                              >
                                {/* Image Preview or File Icon */}
                                {evidence.type === 'image' &&
                                evidence.url ? (
                                  <div className='mb-3 relative'>
                                    <img
                                      src={evidence.url}
                                      alt={
                                        evidence.originalFilename ||
                                        evidence.filename ||
                                        'Evidence'
                                      }
                                      className='w-full h-48 object-cover rounded-lg border border-gray-200'
                                      onError={e => {
                                        e.target.style.display = 'none';
                                        const fallback = e.target.parentElement.querySelector('.image-fallback');
                                        if (fallback) {
                                          fallback.style.display = 'flex';
                                        }
                                      }}
                                    />
                                    <div className='image-fallback w-full h-48 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center hidden absolute top-0 left-0'>
                                      <FaImage className='text-4xl text-gray-400' />
                                    </div>
                                  </div>
                                ) : (
                                  <div className='mb-3 w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center'>
                                    <FaFileAlt className='text-4xl text-gray-400' />
                                  </div>
                                )}

                                {/* File Info */}
                                <div className='space-y-2'>
                                  <div>
                                    <p className='text-xs text-gray-500 mb-1'>
                                      Filename
                                    </p>
                                    <p className='text-sm font-medium text-gray-900 truncate'>
                                      {evidence.originalFilename ||
                                        evidence.filename ||
                                        'Unknown'}
                                    </p>
                                  </div>

                                  {evidence.description && (
                                    <div>
                                      <p className='text-xs text-gray-500 mb-1'>
                                        Description
                                      </p>
                                      <p className='text-sm text-gray-700'>
                                        {evidence.description}
                                      </p>
                                    </div>
                                  )}

                                  <div className='flex items-center justify-between text-xs text-gray-500'>
                                    <div>
                                      {evidence.uploadedBy?.name && (
                                        <span>
                                          By {evidence.uploadedBy.name}
                                        </span>
                                      )}
                                    </div>
                                    {evidence.uploadedAt && (
                                      <span>
                                        {formatDate(evidence.uploadedAt)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Download Button */}
                                  {evidence.url && (
                                    <a
                                      href={evidence.url}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
                                    >
                                      <FaDownload className='w-3 h-3' />
                                      {evidence.type === 'image'
                                        ? 'View Image'
                                        : 'Download File'}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Messages/Comments Thread */}
                    {disputeDetails.messages &&
                      disputeDetails.messages.length > 0 && (
                        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                          <p className='text-xs text-gray-600 uppercase tracking-wide mb-4 font-semibold'>
                            Conversation
                          </p>
                          <div className='space-y-4 max-h-64 overflow-y-auto'>
                            {disputeDetails.messages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                  msg.senderType === 'admin'
                                    ? 'bg-green-100 border border-green-200 ml-4'
                                    : 'bg-white border border-gray-200 mr-4'
                                }`}
                              >
                                <div className='flex items-center justify-between mb-2'>
                                  <div className='flex items-center gap-2'>
                                    <span
                                      className={`text-xs font-semibold ${
                                        msg.senderType === 'admin'
                                          ? 'text-green-800'
                                          : 'text-blue-800'
                                      }`}
                                    >
                                      {msg.senderName ||
                                        (msg.senderType === 'admin'
                                          ? 'Admin'
                                          : 'Buyer')}
                                    </span>
                                    <span className='text-xs text-gray-500'>
                                      {formatDate(msg.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <p className='text-sm text-gray-900 whitespace-pre-wrap'>
                                  {msg.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Add Comment */}
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <p className='text-xs text-gray-600 uppercase tracking-wide mb-3 font-semibold'>
                        Add Comment
                      </p>
                      <textarea
                        value={commentMessage}
                        onChange={e => setCommentMessage(e.target.value)}
                        placeholder='Type your response here. The buyer will be notified via email.'
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none'
                        rows='3'
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!commentMessage.trim() || commentLoading}
                        className='mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                      >
                        <FaComment />
                        {commentLoading ? 'Adding...' : 'Add Comment'}
                      </button>
                    </div>

                    {/* Status Update */}
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <p className='text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold'>
                        Update Status
                      </p>
                      <select
                        value={statusUpdate}
                        onChange={e => setStatusUpdate(e.target.value)}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      >
                        <option value='open'>Open</option>
                        <option value='resolved'>Resolved</option>
                        <option value='closed'>Closed</option>
                      </select>
                    </div>

                    {/* Upload Evidence */}
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <p className='text-xs text-gray-600 uppercase tracking-wide mb-3 font-semibold'>
                        Upload Evidence
                      </p>
                      <input
                        type='file'
                        onChange={e => setEvidenceFile(e.target.files[0])}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3'
                      />
                      <input
                        type='text'
                        value={evidenceDescription}
                        onChange={e => setEvidenceDescription(e.target.value)}
                        placeholder='Evidence description (optional)'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3'
                      />
                      <button
                        onClick={handleUploadEvidence}
                        disabled={!evidenceFile || uploadingEvidence}
                        className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                      >
                        <FaPaperclip />
                        {uploadingEvidence ? 'Uploading...' : 'Upload Evidence'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-12 text-gray-500'>
                    <p>Loading dispute details...</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {disputeDetails && (
                <div className='px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-3'>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={actionLoading === 'update'}
                    className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    <FaCheckCircle />
                    {actionLoading === 'update'
                      ? 'Updating...'
                      : 'Update Dispute'}
                  </button>
                  {disputeDetails.status !== 'closed' && (
                    <button
                      onClick={handleCloseDispute}
                      disabled={actionLoading === 'close'}
                      className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {actionLoading === 'close'
                        ? 'Closing...'
                        : 'Close Dispute'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedDispute(null);
                      setDisputeDetails(null);
                      setCommentMessage('');
                      setEvidenceFile(null);
                      setEvidenceDescription('');
                    }}
                    className='px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DisputeManagement;
