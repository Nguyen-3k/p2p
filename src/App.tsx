import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { BorrowerDashboard } from './pages/BorrowerDashboard';
import { LenderDashboard } from './pages/LenderDashboard';
import { LoansManagementPage } from './pages/LoansManagementPage';
import { CreditScorePage } from './pages/CreditScorePage';
import { FinancialEducationPage } from './pages/FinancialEducationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPage } from './pages/AdminPage';
import type { UserRole } from './types';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const fallback =
      currentUser.role === 'lender'
        ? '/app/lender'
        : currentUser.role === 'admin'
        ? '/app/admin'
        : '/app/borrower';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/app/education" element={<FinancialEducationPage />} />

          {/* Role-based Demo App */}
          <Route
            path="/app/borrower"
            element={
              <ProtectedRoute allowedRoles={['borrower']}>
                <BorrowerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/lender"
            element={
              <ProtectedRoute allowedRoles={['lender']}>
                <LenderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/loans"
            element={
              <ProtectedRoute>
                <LoansManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/credit-score"
            element={
              <ProtectedRoute allowedRoles={['borrower']}>
                <CreditScorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
