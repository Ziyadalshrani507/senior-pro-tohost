import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Email regex pattern for validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  
  // Password requirements (at least 8 chars with letters and numbers)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Validate email if touched
    if (touched.email) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    // Validate password if touched
    if (touched.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
        isValid = false;
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters and include letters and numbers';
        isValid = false;
      }
    }

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Mark field as touched
    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    // Final validation before submission
    const isValid = validateForm();
    
    if (!isValid) {
      // Mark all fields as touched to show all validation errors
      setTouched({
        email: true,
        password: true
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error signing in');
      }

      setSuccess('Sign in successful! Redirecting...');
      login(data.user, data.token);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSubmit} noValidate>
        <h2>Welcome Back</h2>
        
        {formError && <div className="error-message">{formError}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-floating mb-3">
          <input
            type="email"
            className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          <label htmlFor="email">Email address</label>
          {touched.email && errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          <label htmlFor="password">Password</label>
          {touched.password && errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>

        <div className="forgot-password">
          <Link to="/request-password-reset">Forgot password?</Link>
        </div>

        <button 
          type="submit" 
          className="signin-button"
          disabled={!isFormValid && (touched.email || touched.password)}
        >
          Sign In
        </button>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;