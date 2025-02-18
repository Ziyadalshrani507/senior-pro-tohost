import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerifyResetToken.css';

const VerifyResetToken = () => {
  const [formData, setFormData] = useState({
    resetToken: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/password-reset/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error resetting password');
      }

      setSuccess('Password reset successful! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="verify-reset-token-container">
      <form className="verify-reset-token-form" onSubmit={handleSubmit}>
        <h2>Verify Reset Token</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="resetToken"
            name="resetToken"
            placeholder="Reset Token"
            value={formData.resetToken}
            onChange={handleChange}
            required
          />
          <label htmlFor="resetToken">Reset Token</label>
        </div>

        <div className="form-floating">
          <input
            type="password"
            className="form-control"
            id="newPassword"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <label htmlFor="newPassword">New Password</label>
        </div>

        <button type="submit" className="verify-reset-token-button">
          Verify and Reset Password
        </button>
      </form>
    </div>
  );
};

export default VerifyResetToken;