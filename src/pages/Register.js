import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

// IMPORT THE IMAGE
import registerBg from '../assets/3.jpg';

const Register = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
        // Register
        const { data } = await API.post('/auth/register', {
            username: formData.username,
            email: formData.email,
            password: formData.password
        });

        // Auto-login after register
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);

        onLoginSuccess(data.user.role);
        navigate('/shop');

    } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      {/* BRANDING SECTION WITH IMAGE BACKGROUND */}
      <div className="branding-section" style={{ 
        backgroundImage: `url(${registerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.0)', zIndex: 1
        }}></div>


      </div>

      <div className="auth-section">
        <form onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Register
          </button>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;