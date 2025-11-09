import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ListingManagement from './pages/ListingManagement';
import TransactionManagement from './pages/TransactionManagement';
import DisputeManagement from './pages/DisputeManagement';
import NotificationManagement from './pages/NotificationManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="listings" element={<ListingManagement />} />
            <Route path="transactions" element={<TransactionManagement />} />
            <Route path="disputes" element={<DisputeManagement />} />
            <Route path="notifications" element={<NotificationManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
