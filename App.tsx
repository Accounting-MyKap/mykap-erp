import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <HashRouter>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/dashboard"
                    element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                    }
                />
                 <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </AuthProvider>
    </HashRouter>
  );
};

export default App;