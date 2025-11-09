import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
    
    // Simulate OTP verification and account creation
    setTimeout(() => {
      const userData = {
        name: formData.name,
        email: formData.email,
      };
      login(userData);
      navigate('/');
      setLoading(false);
    }, 1000);
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setOtp('');
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up for Dolabb Admin Dashboard</p>
        </div>

        {/* Signup Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@dolabb.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
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
              {loading ? 'Sending OTP...' : (
                <>
                  Send OTP <FaArrowRight />
                </>
              )}
            </button>
          </form>
        ) : (
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
                OTP sent to {formData.email}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Verify OTP & Sign Up'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              className="w-full text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

