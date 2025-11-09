import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaLock, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordReset, setPasswordReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      // In real app, you would send OTP to email/phone here
    }, 1000);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    // Simulate OTP verification
    setTimeout(() => {
      // In real app, verify OTP with backend
      setOtpVerified(true);
      setOtpSent(false);
      setLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    // Simulate password reset
    setTimeout(() => {
      setPasswordReset(true);
      setLoading(false);
      // In real app, reset password with backend
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1000);
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setErrors({});
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center"
        >
          <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            {!otpSent && !otpVerified
              ? 'Enter your email or phone to receive OTP'
              : otpSent && !otpVerified
              ? 'Enter OTP to verify'
              : 'Enter your new password'}
          </p>
        </div>

        {/* Method Toggle - Only show in Step 1 (Send OTP) */}
        {!otpSent && !otpVerified && (
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                method === 'email'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <FaEnvelope className="inline mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                method === 'phone'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <FaPhone className="inline mr-2" />
              Phone
            </button>
          </div>
        )}

        {/* Step 1: Send OTP */}
        {!otpSent && !otpVerified ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {method === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                {method === 'email' ? (
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                ) : (
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={method === 'email' ? email : phone}
                  onChange={(e) =>
                    method === 'email'
                      ? setEmail(e.target.value)
                      : setPhone(e.target.value)
                  }
                  placeholder={
                    method === 'email'
                      ? 'admin@dolabb.com'
                      : '+1 234 567 8900'
                  }
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : (
                <>
                  Send OTP <FaArrowRight />
                </>
              )}
            </button>
          </form>
        ) : otpSent && !otpVerified ? (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength={6}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                OTP sent to {method === 'email' ? email : phone}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              className="w-full text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Resend OTP
            </button>
          </form>
        ) : (
          /* Step 3: Reset Password */
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                  }}
                  placeholder="Enter new password"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder="Confirm new password"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

