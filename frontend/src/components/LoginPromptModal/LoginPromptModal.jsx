import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.css';

const LoginPromptModal = ({ 
  isOpen, 
  onClose, 
  title = "Join the Community!", 
  message = "Please log in to like this place and keep track of what you love."
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/signin', { state: { returnUrl: window.location.pathname } });
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
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="modal-buttons">
            <button className="primary-button" onClick={handleLogin}>
              Sign In
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
