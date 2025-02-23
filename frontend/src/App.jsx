import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import SignUp from './pages/SignUp/SignUp';
import SignIn from './pages/SignIn/SignIn';
import RequestPasswordReset from './pages/RequestPasswordReset/RequestPasswordReset';
import VerifyResetToken from './pages/VerifyResetToken/VerifyResetToken';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ActivityManagement from './pages/ActivityManagement/ActivityManagement';
import Destinations from './pages/Destinations/Destinations';
import DestinationDetails from './pages/DestinationDetails/DestinationDetails';
import Profile from './pages/Profile/Profile';
import Restaurants from './pages/Restaurants/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails/RestaurantDetails';
import RestaurantManagement from './pages/RestaurantManagement/RestaurantManagement';
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
            <Route path="/destinations/:id" element={<DestinationDetails />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/request-password-reset" element={<RequestPasswordReset />} />
            <Route path="/verify-reset-token" element={<VerifyResetToken />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetails />} />
            <Route
              path="/restaurant-management"
              element={
                <AdminRoute>
                  <RestaurantManagement />
                </AdminRoute>
              }
            />
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
          <ToastContainer />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;