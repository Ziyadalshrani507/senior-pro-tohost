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
import Destinations from './pages/Destinations/Destinations';
import DestinationDetails from './pages/DestinationDetails/DestinationDetails';
import Profile from './pages/Profile/Profile';
import Restaurants from './pages/Restaurants/Restaurants';
import RestaurantDetails from './pages/RestaurantDetails/RestaurantDetails';
import Dashboard from './pages/Dashboard/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import ChatWidget from './components/ChatWidget/ChatWidget';
import SearchAll from './pages/SearchAll/SearchAll';

import Hotels from './pages/Hotels/Hotels';
import About from './pages/About/About';
import Tours from './pages/Tours/Tours';


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

// 404 Page Component
const NotFound = () => (
  <main className="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/" className="back-home">Go back home</a>
  </main>
);

function App() {
  return (
    <ErrorBoundary>
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
              <Route path="/about" element={<About />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/search" element={<SearchAll />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/request-password-reset" element={<RequestPasswordReset />} />
              <Route path="/verify-reset-token" element={<VerifyResetToken />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurants/:id" element={<RestaurantDetails />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer />
            <Footer />
            <ChatWidget />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;