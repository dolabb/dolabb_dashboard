import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, adminVerifyOTP, adminSignup } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.token) {
          setIsAuthenticated(true);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await adminLogin(email, password);
      if (response.success && response.token) {
        const userData = {
          ...response.admin,
          token: response.token,
        };
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await adminSignup(signupData);
      if (response.success) {
        return { success: true, data: response };
      }
      return { success: false, error: response.error || 'Signup failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await adminVerifyOTP(email, otp);
      if (response.success && response.token) {
        const userData = {
          ...response.admin,
          token: response.token,
        };
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData };
      }
      return { success: false, error: response.error || 'OTP verification failed' };
    } catch (error) {
      return { success: false, error: error.message || 'OTP verification failed' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    verifyOTP,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

