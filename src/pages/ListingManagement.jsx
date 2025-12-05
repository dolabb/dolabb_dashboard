import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  getListings,
  approveListing,
  rejectListing,
  hideListing,
} from '../services/api';

const ListingManagement = () => {
  const [filter, setFilter] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

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
        alert(`Listing ${action}d successfully`);
        fetchListings();
      } else {
        alert(response.error || `Failed to ${action} listing`);
      }
    } catch (err) {
      alert(`An error occurred while ${action}ing listing`);
    } finally {
      setActionLoading(null);
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
                  key={listing.id}
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
                        ${(listing.price || 0).toLocaleString()}
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
                          {listing.reviewed && !listing.approved && (
                            <button
                              onClick={() => handleAction(listing._id || listing.id, 'approve')}
                              disabled={actionLoading === (listing._id || listing.id)}
                              className='px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 whitespace-nowrap disabled:opacity-50'
                            >
                              {actionLoading === (listing._id || listing.id) ? '...' : 'Approve'}
                            </button>
                          )}
                          {!listing.approved && listing.reviewed && (
                            <button
                              onClick={() => handleAction(listing._id || listing.id, 'reject')}
                              disabled={actionLoading === (listing._id || listing.id)}
                              className='px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 whitespace-nowrap disabled:opacity-50'
                            >
                              {actionLoading === (listing._id || listing.id) ? '...' : 'Reject'}
                            </button>
                          )}
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
    </div>
  );
};

export default ListingManagement;
