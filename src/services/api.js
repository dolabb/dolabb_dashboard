/**
 * API Service for Dolabb Admin Dashboard
 * Handles all API calls to the backend
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://dolabb-backend-2vsj.onrender.com';

/**
 * Helper function to get auth token from localStorage
 */
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

/**
 * Helper function to make API requests
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== Authentication APIs ====================

/**
 * Admin Signup
 * POST /api/auth/admin/signup/
 */
export const adminSignup = async signupData => {
  return apiRequest('/api/auth/admin/signup/', {
    method: 'POST',
    body: JSON.stringify(signupData),
  });
};

/**
 * Admin Login
 * POST /api/auth/admin/login/
 */
export const adminLogin = async (email, password) => {
  return apiRequest('/api/auth/admin/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Admin Verify OTP
 * POST /api/auth/admin/verify-otp/
 */
export const adminVerifyOTP = async (email, otp) => {
  return apiRequest('/api/auth/admin/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
};

/**
 * Admin Forgot Password
 * POST /api/auth/admin/forgot-password/
 */
export const adminForgotPassword = async email => {
  return apiRequest('/api/auth/admin/forgot-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Admin Reset Password
 * POST /api/auth/admin/reset-password/
 */
export const adminResetPassword = async (
  email,
  otp,
  newPassword,
  confirmPassword
) => {
  return apiRequest('/api/auth/admin/reset-password/', {
    method: 'POST',
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
};

/**
 * Admin Logout
 * POST /api/auth/admin/logout/
 */
export const adminLogout = async () => {
  return apiRequest('/api/auth/admin/logout/', {
    method: 'POST',
  });
};

/**
 * Admin Resend OTP (Signup)
 * POST /api/auth/admin/resend-otp/
 */
export const adminResendOTP = async email => {
  return apiRequest('/api/auth/admin/resend-otp/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Admin Resend Forgot Password OTP
 * POST /api/auth/admin/resend-forgot-password-otp/
 */
export const adminResendForgotPasswordOTP = async email => {
  return apiRequest('/api/auth/admin/resend-forgot-password-otp/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// ==================== Dashboard Statistics APIs ====================

/**
 * Get Dashboard Stats
 * GET /api/admin/dashboard/stats/
 */
export const getDashboardStats = async () => {
  return apiRequest('/api/admin/dashboard/stats/');
};

/**
 * Get Revenue Trends
 * GET /api/admin/dashboard/revenue-trends/
 */
export const getRevenueTrends = async () => {
  return apiRequest('/api/admin/dashboard/revenue-trends/');
};

/**
 * Get Sales Over Time
 * GET /api/admin/dashboard/sales-over-time/
 */
export const getSalesOverTime = async () => {
  return apiRequest('/api/admin/dashboard/sales-over-time/');
};

/**
 * Get Listings Status Summary
 * GET /api/admin/dashboard/listings-status/
 */
export const getListingsStatus = async () => {
  return apiRequest('/api/admin/dashboard/listings-status/');
};

/**
 * Get Transaction Types Summary
 * GET /api/admin/dashboard/transaction-types/
 */
export const getTransactionTypes = async () => {
  return apiRequest('/api/admin/dashboard/transaction-types/');
};

/**
 * Get Disputes Status
 * GET /api/admin/dashboard/disputes-status/
 */
export const getDisputesStatus = async () => {
  return apiRequest('/api/admin/dashboard/disputes-status/');
};

/**
 * Get Cashout Requests Summary
 * GET /api/admin/dashboard/cashout-requests-summary/
 */
export const getCashoutRequestsSummary = async () => {
  return apiRequest('/api/admin/dashboard/cashout-requests-summary/');
};

/**
 * Get Recent Activities
 * GET /api/admin/dashboard/recent-activities/
 */
export const getRecentActivities = async (limit = 10, type = null) => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (type) params.append('type', type);
  return apiRequest(`/api/admin/dashboard/recent-activities/?${params.toString()}`);
};

// ==================== User Management APIs ====================

/**
 * Get Users
 * GET /api/admin/users/
 */
export const getUsers = async (page = 1, limit = 20, status = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.append('status', status);
  return apiRequest(`/api/admin/users/?${params.toString()}`);
};

/**
 * Suspend User
 * PUT /api/admin/users/{user_id}/suspend/
 */
export const suspendUser = async userId => {
  return apiRequest(`/api/admin/users/${userId}/suspend/`, {
    method: 'PUT',
  });
};

/**
 * Deactivate User
 * PUT /api/admin/users/{user_id}/deactivate/
 */
export const deactivateUser = async userId => {
  return apiRequest(`/api/admin/users/${userId}/deactivate/`, {
    method: 'PUT',
  });
};

/**
 * Delete User
 * DELETE /api/admin/users/{user_id}/delete/
 */
export const deleteUser = async userId => {
  return apiRequest(`/api/admin/users/${userId}/delete/`, {
    method: 'DELETE',
  });
};

/**
 * Get User Details
 * GET /api/admin/users/{user_id}/
 */
export const getUserDetails = async userId => {
  return apiRequest(`/api/admin/users/${userId}/`);
};

/**
 * Reactivate User
 * PUT /api/admin/users/{user_id}/reactivate/
 */
export const reactivateUser = async (userId, reason = null) => {
  return apiRequest(`/api/admin/users/${userId}/reactivate/`, {
    method: 'PUT',
    body: JSON.stringify(reason ? { reason } : {}),
  });
};

/**
 * Search Users
 * GET /api/admin/users/search/
 */
export const searchUsers = async (query, page = 1, limit = 20) => {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiRequest(`/api/admin/users/search/?${params.toString()}`);
};

/**
 * Bulk User Actions
 * POST /api/admin/users/bulk-action/
 */
export const bulkUserAction = async (userIds, action) => {
  return apiRequest('/api/admin/users/bulk-action/', {
    method: 'POST',
    body: JSON.stringify({ user_ids: userIds, action }),
  });
};

// ==================== Listing Management APIs ====================

/**
 * Get Listings
 * GET /api/admin/listings/
 */
export const getListings = async (page = 1, limit = 20, status = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.append('status', status);
  return apiRequest(`/api/admin/listings/?${params.toString()}`);
};

/**
 * Approve Listing
 * PUT /api/admin/listings/{listing_id}/approve/
 */
export const approveListing = async listingId => {
  return apiRequest(`/api/admin/listings/${listingId}/approve/`, {
    method: 'PUT',
  });
};

/**
 * Reject Listing
 * PUT /api/admin/listings/{listing_id}/reject/
 */
export const rejectListing = async listingId => {
  return apiRequest(`/api/admin/listings/${listingId}/reject/`, {
    method: 'PUT',
  });
};

/**
 * Hide Listing
 * PUT /api/admin/listings/{listing_id}/hide/
 */
export const hideListing = async listingId => {
  return apiRequest(`/api/admin/listings/${listingId}/hide/`, {
    method: 'PUT',
  });
};

/**
 * Update Listing
 * PUT /api/admin/listings/{listing_id}/update/
 */
export const updateListing = async (listingId, listingData) => {
  return apiRequest(`/api/admin/listings/${listingId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(listingData),
  });
};

/**
 * Get Listing Details
 * GET /api/admin/listings/{listing_id}/
 */
export const getListingDetails = async listingId => {
  return apiRequest(`/api/admin/listings/${listingId}/`);
};

/**
 * Mark Listing as Reviewed
 * PUT /api/admin/listings/{listing_id}/mark-reviewed/
 */
export const markListingAsReviewed = async (listingId, notes = null) => {
  return apiRequest(`/api/admin/listings/${listingId}/mark-reviewed/`, {
    method: 'PUT',
    body: JSON.stringify(notes ? { notes } : {}),
  });
};

/**
 * Search Listings
 * GET /api/admin/listings/search/
 */
export const searchListings = async (query, page = 1, limit = 20) => {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiRequest(`/api/admin/listings/search/?${params.toString()}`);
};

/**
 * Bulk Listing Actions
 * POST /api/admin/listings/bulk-action/
 */
export const bulkListingAction = async (listingIds, action) => {
  return apiRequest('/api/admin/listings/bulk-action/', {
    method: 'POST',
    body: JSON.stringify({ listing_ids: listingIds, action }),
  });
};

// ==================== Transaction APIs ====================

/**
 * Get Transactions
 * GET /api/admin/transactions/
 */
export const getTransactions = async (page = 1, limit = 20, type = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (type) params.append('type', type);
  return apiRequest(`/api/admin/transactions/?${params.toString()}`);
};

/**
 * Get Transaction Details
 * GET /api/admin/transactions/{transaction_id}/
 */
export const getTransactionDetails = async transactionId => {
  return apiRequest(`/api/admin/transactions/${transactionId}/`);
};

/**
 * Refund Transaction
 * POST /api/admin/transactions/{transaction_id}/refund/
 */
export const refundTransaction = async (
  transactionId,
  amount = null,
  reason = null,
  refundTo = 'buyer'
) => {
  return apiRequest(`/api/admin/transactions/${transactionId}/refund/`, {
    method: 'POST',
    body: JSON.stringify({
      ...(amount && { amount }),
      ...(reason && { reason }),
      refund_to: refundTo,
    }),
  });
};

/**
 * Search Transactions
 * GET /api/admin/transactions/search/
 */
export const searchTransactions = async (query, page = 1, limit = 20) => {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiRequest(`/api/admin/transactions/search/?${params.toString()}`);
};

// ==================== Cashout Request APIs ====================

/**
 * Get Cashout Requests
 * GET /api/admin/cashout-requests/
 */
export const getCashoutRequests = async (
  page = 1,
  limit = 20,
  status = null
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.append('status', status);
  return apiRequest(`/api/admin/cashout-requests/?${params.toString()}`);
};

/**
 * Approve Cashout
 * PUT /api/admin/cashout-requests/{cashout_id}/approve/
 */
export const approveCashout = async cashoutId => {
  return apiRequest(`/api/admin/cashout-requests/${cashoutId}/approve/`, {
    method: 'PUT',
  });
};

/**
 * Reject Cashout
 * PUT /api/admin/cashout-requests/{cashout_id}/reject/
 */
export const rejectCashout = async (cashoutId, reason = null) => {
  return apiRequest(`/api/admin/cashout-requests/${cashoutId}/reject/`, {
    method: 'PUT',
    body: JSON.stringify(reason ? { reason } : {}),
  });
};

/**
 * Get Cashout Request Details
 * GET /api/admin/cashout-requests/{cashout_id}/
 */
export const getCashoutRequestDetails = async cashoutId => {
  return apiRequest(`/api/admin/cashout-requests/${cashoutId}/`);
};

// ==================== Fee Settings APIs ====================

/**
 * Get Fee Settings
 * GET /api/admin/fee-settings/
 */
export const getFeeSettings = async () => {
  return apiRequest('/api/admin/fee-settings/');
};

/**
 * Update Fee Settings
 * PUT /api/admin/fee-settings/update/
 */
export const updateFeeSettings = async feeSettings => {
  return apiRequest('/api/admin/fee-settings/update/', {
    method: 'PUT',
    body: JSON.stringify(feeSettings),
  });
};

/**
 * Get Fee Collection Summary
 * GET /api/admin/fee-settings/summary/
 */
export const getFeeCollectionSummary = async (
  fromDate = null,
  toDate = null
) => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const queryString = params.toString();
  return apiRequest(
    `/api/admin/fee-settings/summary/${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * Calculate Fee
 * GET /api/admin/fee-settings/calculate/
 */
export const calculateFee = async amount => {
  const params = new URLSearchParams({ amount: amount.toString() });
  return apiRequest(`/api/admin/fee-settings/calculate/?${params.toString()}`);
};

// ==================== Dispute Management APIs ====================

/**
 * Get Disputes
 * GET /api/admin/disputes/
 */
export const getDisputes = async (page = 1, limit = 20, status = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.append('status', status);
  return apiRequest(`/api/admin/disputes/?${params.toString()}`);
};

/**
 * Update Dispute
 * PUT /api/admin/disputes/{dispute_id}/update/
 */
export const updateDispute = async (disputeId, disputeData) => {
  return apiRequest(`/api/admin/disputes/${disputeId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(disputeData),
  });
};

/**
 * Close Dispute
 * PUT /api/admin/disputes/{dispute_id}/close/
 */
export const closeDispute = async (disputeId, resolution = null) => {
  return apiRequest(`/api/admin/disputes/${disputeId}/close/`, {
    method: 'PUT',
    body: JSON.stringify(resolution ? { resolution } : {}),
  });
};

/**
 * Get Dispute Details
 * GET /api/admin/disputes/{dispute_id}/
 */
export const getDisputeDetails = async disputeId => {
  return apiRequest(`/api/admin/disputes/${disputeId}/`);
};

/**
 * Add Dispute Message/Note
 * POST /api/admin/disputes/{dispute_id}/messages/
 */
export const addDisputeMessage = async (disputeId, message, type = 'admin_note') => {
  return apiRequest(`/api/admin/disputes/${disputeId}/messages/`, {
    method: 'POST',
    body: JSON.stringify({ message, type }),
  });
};

/**
 * Upload Dispute Evidence
 * POST /api/admin/disputes/{dispute_id}/evidence/
 */
export const uploadDisputeEvidence = async (disputeId, file, description = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);

  const token = getAuthToken();
  const url = `${API_BASE_URL}/api/admin/disputes/${disputeId}/evidence/`;

  const config = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== Affiliate Management APIs ====================

/**
 * Get Affiliate Details
 * GET /api/admin/affiliates/{affiliate_id}/
 */
export const getAffiliateDetails = async affiliateId => {
  return apiRequest(`/api/admin/affiliates/${affiliateId}/`);
};

/**
 * Toggle Affiliate Status
 * PUT /api/admin/affiliates/{affiliate_id}/toggle-status/
 */
export const toggleAffiliateStatus = async (affiliateId, status) => {
  return apiRequest(`/api/admin/affiliates/${affiliateId}/toggle-status/`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Note: The following affiliate endpoints exist in /api/affiliate/ path
// They are included here for completeness but may need path adjustment

/**
 * Get All Affiliates (from /api/affiliate/all/)
 * GET /api/affiliate/all/
 */
export const getAllAffiliates = async (page = 1, limit = 20) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiRequest(`/api/affiliate/all/?${params.toString()}`);
};

/**
 * Get Affiliate Transactions (from /api/affiliate/{affiliate_id}/transactions/)
 * GET /api/affiliate/{affiliate_id}/transactions/
 */
export const getAffiliateTransactions = async (affiliateId, page = 1, limit = 20) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return apiRequest(`/api/affiliate/${affiliateId}/transactions/?${params.toString()}`);
};

/**
 * Update Affiliate Commission (from /api/affiliate/{affiliate_id}/update-commission/)
 * PUT /api/affiliate/{affiliate_id}/update-commission/
 */
export const updateAffiliateCommission = async (affiliateId, commissionRate) => {
  return apiRequest(`/api/affiliate/${affiliateId}/update-commission/`, {
    method: 'PUT',
    body: JSON.stringify({ commissionRate }),
  });
};

/**
 * Suspend Affiliate (from /api/affiliate/{affiliate_id}/suspend/)
 * PUT /api/affiliate/{affiliate_id}/suspend/
 */
export const suspendAffiliate = async affiliateId => {
  return apiRequest(`/api/affiliate/${affiliateId}/suspend/`, {
    method: 'PUT',
  });
};

/**
 * Get Affiliate Payout Requests (from /api/affiliate/payout-requests/)
 * GET /api/affiliate/payout-requests/
 */
export const getAffiliatePayoutRequests = async (page = 1, limit = 20, status = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.append('status', status);
  return apiRequest(`/api/affiliate/payout-requests/?${params.toString()}`);
};

/**
 * Approve Affiliate Payout (from /api/affiliate/payout-requests/{payout_id}/approve/)
 * PUT /api/affiliate/payout-requests/{payout_id}/approve/
 */
export const approveAffiliatePayout = async payoutId => {
  return apiRequest(`/api/affiliate/payout-requests/${payoutId}/approve/`, {
    method: 'PUT',
  });
};

/**
 * Reject Affiliate Payout (from /api/affiliate/payout-requests/{payout_id}/reject/)
 * PUT /api/affiliate/payout-requests/{payout_id}/reject/
 */
export const rejectAffiliatePayout = async (payoutId, reason = null) => {
  return apiRequest(`/api/affiliate/payout-requests/${payoutId}/reject/`, {
    method: 'PUT',
    body: JSON.stringify(reason ? { reason } : {}),
  });
};

// ==================== Notification Management APIs ====================

/**
 * Toggle Notification Status
 * PUT /api/admin/notifications/{notification_id}/toggle/
 */
export const toggleNotificationStatus = async (notificationId, active) => {
  return apiRequest(`/api/admin/notifications/${notificationId}/toggle/`, {
    method: 'PUT',
    body: JSON.stringify({ active }),
  });
};

/**
 * Get Notification Templates
 * GET /api/admin/notifications/templates/
 */
export const getNotificationTemplates = async () => {
  return apiRequest('/api/admin/notifications/templates/');
};

// Note: The following notification endpoints exist in /api/notifications/admin/ path
// They are included here for completeness but may need path adjustment

/**
 * Create Notification (from /api/notifications/admin/create/)
 * POST /api/notifications/admin/create/
 */
export const createNotification = async notificationData => {
  return apiRequest('/api/notifications/admin/create/', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  });
};

/**
 * Get Notifications List (from /api/notifications/admin/list/)
 * GET /api/notifications/admin/list/
 */
export const getNotifications = async (page = 1, limit = 20, type = null, targetAudience = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (type) params.append('type', type);
  if (targetAudience) params.append('targetAudience', targetAudience);
  return apiRequest(`/api/notifications/admin/list/?${params.toString()}`);
};

/**
 * Update Notification (from /api/notifications/admin/{notification_id}/update/)
 * PUT /api/notifications/admin/{notification_id}/update/
 */
export const updateNotification = async (notificationId, notificationData) => {
  return apiRequest(`/api/notifications/admin/${notificationId}/update/`, {
    method: 'PUT',
    body: JSON.stringify(notificationData),
  });
};

/**
 * Delete Notification (from /api/notifications/admin/{notification_id}/delete/)
 * DELETE /api/notifications/admin/{notification_id}/delete/
 */
export const deleteNotification = async notificationId => {
  return apiRequest(`/api/notifications/admin/${notificationId}/delete/`, {
    method: 'DELETE',
  });
};

/**
 * Send Notification (from /api/notifications/admin/{notification_id}/send/)
 * POST /api/notifications/admin/{notification_id}/send/
 */
export const sendNotification = async (notificationId, immediate = true) => {
  return apiRequest(`/api/notifications/admin/${notificationId}/send/`, {
    method: 'POST',
    body: JSON.stringify({ immediate }),
  });
};

// ==================== General Admin APIs ====================

/**
 * Get Admin Profile
 * GET /api/admin/profile/
 */
export const getAdminProfile = async () => {
  return apiRequest('/api/admin/profile/');
};

/**
 * Update Admin Profile
 * PUT /api/admin/profile/update/
 */
export const updateAdminProfile = async profileData => {
  return apiRequest('/api/admin/profile/update/', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

/**
 * Change Admin Password
 * PUT /api/admin/profile/change-password/
 */
export const changeAdminPassword = async (currentPassword, newPassword, confirmPassword) => {
  return apiRequest('/api/admin/profile/change-password/', {
    method: 'PUT',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
};

/**
 * Get Activity Logs
 * GET /api/admin/activity-logs/
 */
export const getActivityLogs = async (page = 1, limit = 20, action = null, fromDate = null, toDate = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (action) params.append('action', action);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  return apiRequest(`/api/admin/activity-logs/?${params.toString()}`);
};

// ==================== Reporting APIs ====================

/**
 * Generate Report
 * POST /api/admin/reports/generate/
 */
export const generateReport = async (reportType, fromDate, toDate, format = 'pdf') => {
  return apiRequest('/api/admin/reports/generate/', {
    method: 'POST',
    body: JSON.stringify({
      report_type: reportType,
      fromDate,
      toDate,
      format,
    }),
  });
};

/**
 * Get Report Templates
 * GET /api/admin/reports/templates/
 */
export const getReportTemplates = async () => {
  return apiRequest('/api/admin/reports/templates/');
};

// ==================== Hero Section Management APIs ====================

/**
 * Get Hero Section
 * GET /api/admin/hero-section/
 */
export const getHeroSection = async () => {
  return apiRequest('/api/admin/hero-section/');
};

/**
 * Update Hero Section
 * PUT /api/admin/hero-section/update/
 */
export const updateHeroSection = async (heroData) => {
  const formData = new FormData();
  
  // Validate and append backgroundType (required field)
  const validBackgroundTypes = ['image', 'single_color', 'gradient'];
  let backgroundType = heroData.backgroundType;
  
  // Ensure it's a string and trim whitespace
  if (typeof backgroundType !== 'string') {
    backgroundType = String(backgroundType || 'image');
  }
  backgroundType = backgroundType.trim();
  
  // Ensure it's exactly one of the valid types (case-sensitive exact match)
  if (!validBackgroundTypes.includes(backgroundType)) {
    // Log for debugging
    console.error('BackgroundType validation failed:', {
      received: backgroundType,
      type: typeof backgroundType,
      length: backgroundType.length,
      charCodes: backgroundType.split('').map(c => c.charCodeAt(0)),
      validTypes: validBackgroundTypes
    });
    throw new Error(`Invalid background type: "${backgroundType}". Must be one of: ${validBackgroundTypes.join(', ')}`);
  }
  
  // Append the exact string value (ensure no extra characters)
  formData.append('backgroundType', backgroundType);
  
  // Log what we're sending (for debugging)
  console.log('Sending backgroundType to API:', backgroundType, 'Type:', typeof backgroundType);
  
  // Append file if provided
  if (heroData.image) {
    formData.append('image', heroData.image);
  }
  
  // Append other fields
  if (heroData.imageUrl) formData.append('imageUrl', heroData.imageUrl);
  if (heroData.singleColor) formData.append('singleColor', heroData.singleColor);
  if (heroData.gradientColors && Array.isArray(heroData.gradientColors)) {
    formData.append('gradientColors', JSON.stringify(heroData.gradientColors));
  }
  if (heroData.gradientDirection) formData.append('gradientDirection', heroData.gradientDirection);
  if (heroData.title !== undefined) formData.append('title', heroData.title);
  if (heroData.subtitle !== undefined) formData.append('subtitle', heroData.subtitle);
  if (heroData.buttonText !== undefined) formData.append('buttonText', heroData.buttonText);
  if (heroData.buttonLink !== undefined) formData.append('buttonLink', heroData.buttonLink);
  if (heroData.textColor) formData.append('textColor', heroData.textColor);
  if (heroData.isActive !== undefined) formData.append('isActive', heroData.isActive.toString());

  const token = getAuthToken();
  const url = `${API_BASE_URL}/api/admin/hero-section/update/`;

  const config = {
    method: 'PUT',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
