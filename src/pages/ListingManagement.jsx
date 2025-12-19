import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  getListings,
  approveListing,
  rejectListing,
  hideListing,
  updateListing,
  getListingDetails,
} from '../services/api';
import { useToast } from '../components/Toast';

const ListingManagement = () => {
  const { success, error: showError } = useToast();
  const [filter, setFilter] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    price: '',
    currency: 'SAR',
    status: 'active',
    approved: false,
    reviewed: false,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [viewingListing, setViewingListing] = useState(null);
  const [listingDetails, setListingDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [currentPage, filter]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'all' ? null : filter;
      const response = await getListings(currentPage, 20, status);
      if (response.success) {
        setListings(response.listings || []);
        setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      } else {
        setError(response.error || 'Failed to load listings');
      }
    } catch (err) {
      setError('An error occurred while loading listings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (listingId, action) => {
    setActionLoading(listingId);
    try {
      let response;
      switch (action) {
        case 'approve':
          response = await approveListing(listingId);
          break;
        case 'reject':
          response = await rejectListing(listingId);
          break;
        case 'hide':
          response = await hideListing(listingId);
          break;
        default:
          return;
      }

      if (response.success) {
        success(`Listing ${action}d successfully`);
        // Refresh listings first
        const status = filter === 'all' ? null : filter;
        const refreshResponse = await getListings(currentPage, 20, status);
        if (refreshResponse.success) {
          const updatedListings = refreshResponse.listings || [];
          setListings(updatedListings);
          setPagination(refreshResponse.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
          
          // Refresh listing details if viewing
          if (viewingListing === listingId && listingDetails) {
            const updatedListing = updatedListings.find(
              (l) => (l._id || l.id) === listingId
            );
            if (updatedListing) {
              setListingDetails(updatedListing);
            }
          }
        }
      } else {
        showError(response.error || `Failed to ${action} listing`);
      }
    } catch (err) {
      showError(`An error occurred while ${action}ing listing: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewClick = async (listing) => {
    const listingId = listing._id || listing.id;
    setViewLoading(true);
    setViewingListing(listingId);
    try {
      // Fetch all listings and find the one by ID (as individual endpoint doesn't exist)
      const response = await getListings(1, 1000); // Get a large number to find the listing
      if (response.success) {
        const allListings = response.listings || [];
        const listingData = allListings.find(
          (l) => (l._id || l.id) === listingId
        );
        
        if (listingData) {
          setListingDetails(listingData);
        } else {
          // If not found in first page, try to find in current listings state
          const foundInState = listings.find(
            (l) => (l._id || l.id) === listingId
          );
          if (foundInState) {
            setListingDetails(foundInState);
          } else {
            showError('Listing not found');
            setViewingListing(null);
          }
        }
      } else {
        // Fallback: use the listing data we already have
        setListingDetails(listing);
      }
    } catch (err) {
      // Fallback: use the listing data we already have from the table
      console.warn('Failed to fetch listing details, using cached data:', err);
      setListingDetails(listing);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditClick = async (listing) => {
    try {
      // Use the listing data we already have from the table
      setEditFormData({
        title: listing.title || '',
        price: listing.price || '',
        currency: listing.currency || 'SAR',
        status: listing.status || 'active',
        approved: listing.approved || false,
        reviewed: listing.reviewed || false,
      });
      setEditingListing(listing._id || listing.id);
    } catch (err) {
      showError('An error occurred while loading listing details');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingListing) return;

    setEditLoading(true);
    try {
      const response = await updateListing(editingListing, editFormData);
      if (response.success) {
        success('Listing updated successfully');
        setEditingListing(null);
        fetchListings();
      } else {
        showError(response.error || 'Failed to update listing');
      }
    } catch (err) {
      showError('An error occurred while updating listing');
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = status => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      removed: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
          colors[status] || colors.active
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap'>
          Listing Management
        </h1>
        <p className='text-gray-600 text-sm sm:text-base whitespace-nowrap'>
          View and manage all listed items and features
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200'>
        <div className='flex gap-2 sm:gap-4 flex-wrap'>
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => { setFilter('active'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setFilter('sold'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'sold'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sold
          </button>
          <button
            onClick={() => { setFilter('removed'); setCurrentPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
              filter === 'removed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Removed
          </button>
        </div>
      </div>

      {/* Listings Table */}
      <div className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listings...</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto' style={{ maxWidth: '100%' }}>
              <table className='w-full min-w-[900px]'>
                <thead className='bg-gray-50 text-gray-900'>
                  <tr>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap'>
                      Listing
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap'>
                      Seller
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap'>
                      Category
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap'>
                      Price
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap'>
                      Status
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap'>
                      Review
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                        No listings found
                      </td>
                    </tr>
                  ) : (
                    listings.map((listing, index) => (
                <motion.tr
                  key={listing._id || listing.id || `listing-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className='hover:bg-gray-50'
                >
                      <td className='px-4 sm:px-6 py-4'>
                        <div>
                          <p className='font-semibold text-gray-900 whitespace-nowrap'>
                            {listing.title}
                          </p>
                          <p className='text-sm text-gray-600 whitespace-nowrap'>
                            Created: {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className='px-4 sm:px-6 py-4 text-sm text-gray-700 whitespace-nowrap'>
                        {listing.SellerName || 'N/A'}
                      </td>
                      <td className='px-4 sm:px-6 py-4'>
                        <span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs whitespace-nowrap'>
                          {listing.category || 'N/A'}
                        </span>
                      </td>
                      <td className='px-4 sm:px-6 py-4 font-semibold text-green-600 whitespace-nowrap'>
                        {listing.currency || 'SAR'} {(listing.price || 0).toLocaleString()}
                      </td>
                      <td className='px-4 sm:px-6 py-4'>
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className='px-4 sm:px-6 py-4'>
                        <div className='flex gap-2 flex-wrap'>
                          {listing.reviewed ? (
                            <span className='px-2 py-1 bg-green-100 text-green-800 rounded text-xs whitespace-nowrap'>
                              Reviewed
                            </span>
                          ) : (
                            <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs whitespace-nowrap'>
                              Pending
                            </span>
                          )}
                          {listing.approved && (
                            <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs whitespace-nowrap'>
                              Approved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-4 sm:px-6 py-4'>
                        <div className='flex gap-2 flex-wrap'>
                          <button
                            onClick={() => handleViewClick(listing)}
                            className='px-2 sm:px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 whitespace-nowrap'
                            title="View Listing Details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditClick(listing)}
                            className='px-2 sm:px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 whitespace-nowrap'
                            title="Edit Listing"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleAction(listing._id || listing.id, 'approve')}
                            disabled={
                              actionLoading === (listing._id || listing.id) ||
                              (listing.approved && listing.reviewed)
                            }
                            className='px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
                            title={listing.approved && listing.reviewed ? 'Already approved' : 'Approve Listing'}
                          >
                            {actionLoading === (listing._id || listing.id) ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleAction(listing._id || listing.id, 'reject')}
                            disabled={
                              actionLoading === (listing._id || listing.id) ||
                              (listing.approved && listing.reviewed)
                            }
                            className='px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
                            title={listing.approved && listing.reviewed ? 'Already approved' : 'Reject Listing'}
                          >
                            {actionLoading === (listing._id || listing.id) ? '...' : 'Reject'}
                          </button>
                          {listing.status === 'active' && (
                            <button
                              onClick={() => handleAction(listing._id || listing.id, 'hide')}
                              disabled={actionLoading === (listing._id || listing.id)}
                              className='px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 whitespace-nowrap disabled:opacity-50'
                            >
                              {actionLoading === (listing._id || listing.id) ? '...' : 'Hide'}
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

      {/* View Listing Details Modal */}
      {viewingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Listing Details</h2>
                <button
                  onClick={() => {
                    setViewingListing(null);
                    setListingDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {viewLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading listing details...</p>
                </div>
              ) : listingDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <p className="text-gray-900 font-semibold">{listingDetails.title || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <p className="text-gray-900 font-semibold">
                        {listingDetails.currency || 'SAR'} {(listingDetails.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                      <p className="text-gray-900">{listingDetails.SellerName || listingDetails.sellerName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <p className="text-gray-900">{listingDetails.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div>{getStatusBadge(listingDetails.status)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <p className="text-gray-900">{listingDetails.currency || 'SAR'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Approved</label>
                      <p className="text-gray-900">
                        {listingDetails.approved ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Yes</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">No</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed</label>
                      <p className="text-gray-900">
                        {listingDetails.reviewed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Yes</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">No</span>
                        )}
                      </p>
                    </div>
                    {listingDetails.createdAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                        <p className="text-gray-900">{new Date(listingDetails.createdAt).toLocaleString()}</p>
                      </div>
                    )}
                    {listingDetails.updatedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                        <p className="text-gray-900">{new Date(listingDetails.updatedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {listingDetails.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-gray-900">{listingDetails.description}</p>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleAction(viewingListing, 'approve')}
                        disabled={
                          actionLoading === viewingListing ||
                          (listingDetails.approved && listingDetails.reviewed)
                        }
                        className='px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
                        title={listingDetails.approved && listingDetails.reviewed ? 'Already approved' : 'Approve Listing'}
                      >
                        {actionLoading === viewingListing ? '...' : '✅ Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(viewingListing, 'reject')}
                        disabled={
                          actionLoading === viewingListing ||
                          (listingDetails.approved && listingDetails.reviewed)
                        }
                        className='px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
                        title={listingDetails.approved && listingDetails.reviewed ? 'Already approved' : 'Reject Listing'}
                      >
                        {actionLoading === viewingListing ? '...' : '❌ Reject'}
                      </button>
                      {listingDetails.status === 'active' && (
                        <button
                          onClick={() => handleAction(viewingListing, 'hide')}
                          disabled={actionLoading === viewingListing}
                          className='px-4 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 whitespace-nowrap disabled:opacity-50'
                        >
                          {actionLoading === viewingListing ? '...' : '🚫 Hide'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setViewingListing(null);
                          handleEditClick({ _id: viewingListing, id: viewingListing });
                        }}
                        className='px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 whitespace-nowrap'
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No details available</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Listing</h2>
                <button
                  onClick={() => setEditingListing(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={editFormData.currency}
                      onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="SAR">SAR (Saudi Riyal)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="removed">Removed</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.approved}
                      onChange={(e) => setEditFormData({ ...editFormData, approved: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Approved</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.reviewed}
                      onChange={(e) => setEditFormData({ ...editFormData, reviewed: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Reviewed</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {editLoading ? 'Updating...' : 'Update Listing'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingListing(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ListingManagement;
