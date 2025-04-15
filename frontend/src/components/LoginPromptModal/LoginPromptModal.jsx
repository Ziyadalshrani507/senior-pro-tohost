import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.css';

const LoginPromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { returnUrl: window.location.pathname } });
  };

  const handleSignup = () => {
    onClose();
    navigate('/signup', { state: { returnUrl: window.location.pathname } });
  };

  return (
    <div className="login-prompt-overlay" onClick={onClose}>
      <div className="login-prompt-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="modal-content">
          <h2>Join the Community!</h2>
          <p>Please log in to like this place and keep track of what you love.</p>
          <div className="modal-buttons">
            <button className="primary-button" onClick={handleLogin}>
              Log In
            </button>
            <button className="secondary-button" onClick={handleSignup}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
