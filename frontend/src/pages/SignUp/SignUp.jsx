import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    gender: false
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
    const newErrors = { 
      firstName: '', 
      lastName: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      gender: '' 
    };
    let isValid = true;

    // First name validation
    if (touched.firstName && !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last name validation
    if (touched.lastName && !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Email validation
    if (touched.email) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    // Password validation
    if (touched.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
        isValid = false;
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters and include letters and numbers';
        isValid = false;
      }
    }

    // Confirm password validation
    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    // Gender validation
    if (touched.gender && !formData.gender) {
      newErrors.gender = 'Please select your gender';
      isValid = false;
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

    // Mark all fields as touched to show all validation errors
    const allTouched = Object.keys(touched).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);

    // Final validation before submission
    const isValid = validateForm();
    
    if (!isValid) {
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error signing up');
      }

      setSuccess('Sign up successful! Redirecting...');
      login(data.user, data.token);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <h2>Create Account</h2>
        
        {formError && <div className="error-message">{formError}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="text"
                className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`}
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <label htmlFor="firstName">First Name</label>
              {touched.firstName && errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="text"
                className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`}
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <label htmlFor="lastName">Last Name</label>
              {touched.lastName && errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
            </div>
          </div>
        </div>

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
          {touched.password && !errors.password && (
            <div className="password-requirements text-muted">
              <small>Password must contain at least 8 characters with letters and numbers</small>
            </div>
          )}
        </div>

        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          {touched.confirmPassword && errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
        </div>

        <div className="form-floating mb-3">
          <select
            className={`form-select ${touched.gender && errors.gender ? 'is-invalid' : ''}`}
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <label htmlFor="gender">Gender</label>
          {touched.gender && errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
        </div>

        <button 
          type="submit" 
          className="signup-button"
          disabled={!isFormValid && Object.values(touched).some(Boolean)}
        >
          <i className="bi bi-person-plus"></i> Create Account
        </button>

        <p className="login-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
