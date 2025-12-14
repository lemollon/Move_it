import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import BuyerDashboard from '@/pages/BuyerDashboard';
import SellerDashboard from '@/pages/SellerDashboard';
import VendorDashboard from '@/pages/VendorDashboard';
import TransactionCenter from '@/pages/TransactionCenter';
import ContractInfoCollector from '@/pages/ContractInfoCollector';

// Protected Route Component
import ProtectedRoute from '@/components/shared/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - Buyer */}
          <Route
            path="/buyer/*"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Seller */}
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Vendor */}
          <Route
            path="/vendor/*"
            element={
              <ProtectedRoute requiredRole="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Transaction Center - accessible by all authenticated users */}
          <Route
            path="/transaction/:transactionId"
            element={
              <ProtectedRoute>
                <TransactionCenter />
              </ProtectedRoute>
            }
          />

          {/* Contract Info Collector */}
          <Route
            path="/contract-info/:transactionId"
            element={
              <ProtectedRoute>
                <ContractInfoCollector />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
