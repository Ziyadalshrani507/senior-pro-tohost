import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RequestPasswordReset.css';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/password-reset/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error requesting password reset');
      }

      setSuccess('Password reset code sent to email');
      setTimeout(() => {
        navigate('/verify-reset-token');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="request-password-reset-container">
      <form className="request-password-reset-form" onSubmit={handleSubmit}>
        <h2>Request Password Reset</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email">Email</label>
        </div>

        <button type="submit" className="request-password-reset-button">
          Request Password Reset
        </button>
      </form>
    </div>
  );
};

export default RequestPasswordReset;