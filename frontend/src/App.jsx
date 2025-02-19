import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import SignUp from './pages/SignUp/SignUp';
import SignIn from './pages/SignIn/SignIn';
import RequestPasswordReset from './pages/RequestPasswordReset/RequestPasswordReset'; // Import RequestPasswordReset
import VerifyResetToken from './pages/VerifyResetToken/VerifyResetToken'; // Import VerifyResetToken
import ResetPassword from './pages/ResetPassword/ResetPassword'; // Import ResetPassword
import ActivityManagement from './pages/ActivityManagement/ActivityManagement';
import Destinations from './pages/Destinations/Destinations';
import Profile from './pages/Profile/Profile'; // Import Profile
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={
              <main className="main-content">
                <h1>Welcome to Tourism Platform</h1>
                <p>Discover amazing destinations and plan your next adventure!</p>
              </main>
            } />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/request-password-reset" element={<RequestPasswordReset />} /> {/* Add this line */}
            <Route path="/verify-reset-token" element={<VerifyResetToken />} /> {/* Add this line */}
            <Route path="/reset-password" element={<ResetPassword />} /> {/* Ensure this line is correct */}
            <Route path="/activity-management" element={
              <AdminRoute>
                <ActivityManagement />
              </AdminRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;