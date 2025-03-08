import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import QuizResults from './pages/QuizResults';
import TokenPurchase from './pages/TokenPurchase';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel';

// Auth context
import { AuthProvider, AuthContext } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <Container className="flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<HomeRoute><Home /></HomeRoute>} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
            <Route path="/reset-password" element={<AuthRoute><ResetPassword /></AuthRoute>} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/quizzes/:subject" element={
              <PrivateRoute>
                <QuizList />
              </PrivateRoute>
            } />
            <Route path="/quizzes/:subject/:quizName" element={
              <PrivateRoute>
                <QuizDetail />
              </PrivateRoute>
            } />
            <Route path="/results/:subject/:quizName" element={
              <PrivateRoute>
                <QuizResults />
              </PrivateRoute>
            } />
            <Route path="/purchase-tokens" element={
              <PrivateRoute>
                <TokenPurchase />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </AuthProvider>
  );
}

// Private route component
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Auth route component (redirects to dashboard if already logged in)
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

// Home route component (redirects to dashboard if already logged in)
function HomeRoute({ children }) {
  const { isAuthenticated, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

// Admin route component
function AdminRoute({ children }) {
  const { isAuthenticated, currentUser, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }
  
  return isAuthenticated && currentUser?.role === 'admin' 
    ? children 
    : <Navigate to="/dashboard" />;
}

export default App; 