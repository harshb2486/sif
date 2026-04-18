// App.js
// Main React application with routing and modern layout

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, FloatingChatBot } from './components';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProductsPage,
  SalesPersonsPage,
  ReportsPage,
  CreateOrderPage,
  MyOrdersPage,
  MyCommissionsPage,
  WaitingApprovalPage,
  ChatPage
} from './pages';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />

        {/* Protected Routes - Common */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Waiting Approval */}
        <Route
          path="/waiting-approval"
          element={
            <ProtectedRoute>
              <WaitingApprovalPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Company Admin Only */}
        <Route
          path="/products"
          element={
            <ProtectedRoute requiredRole="company_admin">
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRole={["company_admin", "platform_admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Platform Admin Only */}
        <Route
          path="/sales-persons"
          element={
            <ProtectedRoute requiredRole="platform_admin">
              <SalesPersonsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Sales Person Only */}
        <Route
          path="/create-order"
          element={
            <ProtectedRoute requiredRole="sales" requireVerification={true}>
              <CreateOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute requiredRole="sales" requireVerification={true}>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-commissions"
          element={
            <ProtectedRoute requiredRole="sales" requireVerification={true}>
              <MyCommissionsPage />
            </ProtectedRoute>
          }
        />

        {/* Chat - Available for all authenticated users */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard or login */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
      </Routes>
      <FloatingChatBot />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;