import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import AuthGuard from './components/Auth/AuthGuard';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import HistoryPage from './pages/History';
import { useAuth } from './context/AuthContext';

function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  );
}

// Root: send authenticated users to /dashboard, unauthenticated to landing page
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  // Redirect to the standalone landing page
  window.location.replace('/landing.html');
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } />
            <Route path="/quiz" element={
              <ProtectedLayout>
                <Quiz />
              </ProtectedLayout>
            } />
            <Route path="/history" element={
              <ProtectedLayout>
                <HistoryPage />
              </ProtectedLayout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
