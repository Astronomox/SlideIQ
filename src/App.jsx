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

function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <Routes>
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
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
