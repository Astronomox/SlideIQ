// Quiz.jsx — standalone quiz page (redirects to dashboard if no active quiz)
import React from 'react';
import { Navigate } from 'react-router-dom';

// Quiz is launched from Dashboard via state; redirect if accessed directly
export default function Quiz() {
  return <Navigate to="/dashboard" replace />;
}
