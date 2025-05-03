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
// Using unified ItemDetails component instead of separate components
import Profile from './pages/Profile/Profile';
import Restaurants from './pages/Restaurants/Restaurants';

import Dashboard from './pages/Dashboard/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ItineraryProvider } from './context/ItineraryContext';
import ChatWidget from './components/ChatWidget/ChatWidget';
import ChatbasePageTracker from './components/ChatbaseTracker/ChatbasePageTracker';
import SearchAll from './pages/SearchAll/SearchAll';
import Hotels from './pages/Hotels/Hotels';
import About from './pages/About/About';
import Tours from './pages/Tours/Tours';
import Home from './pages/Home/Home';
import ItineraryPlannerPage from './pages/ItineraryPlanner/ItineraryPlannerPage';
import ItineraryDetailsPage from './pages/ItineraryPlanner/ItineraryDetailsPage';
import ItemDetails from './pages/ItemDetails/ItemDetails';

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
        <ItineraryProvider>
          <Router>
            <div className="app">
              <Header />
              <ChatbasePageTracker />
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/:type/:id" element={<ItemDetails />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/itinerary-planner" element={<ItineraryPlannerPage />} />
              <Route path="/itinerary/:id" element={
                <ProtectedRoute>
                  <ItineraryDetailsPage />
                </ProtectedRoute>
              } />
              
              {/* Detailed view routes handled by individual components */}
              <Route path="/search" element={<SearchAll />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/request-password-reset" element={<RequestPasswordReset />} />
              <Route path="/verify-reset-token" element={<VerifyResetToken />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/restaurants" element={<Restaurants />} />
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
        </ItineraryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;