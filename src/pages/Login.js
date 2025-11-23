import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api'; 

// IMPORT THE IMAGE
// Ensure 1.jpg is in src/assets/
import loginBg from '../assets/1.jpg';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);

      onLoginSuccess(data.user.role);
      
      if (data.user.role === 'admin') {
        navigate('/admin/products');
      } else {
        navigate('/shop');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      {/* BRANDING SECTION WITH IMAGE BACKGROUND */}
      <div className="branding-section" style={{ 
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Dark Overlay to make text readable */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.0)', zIndex: 1
        }}></div>


      </div>

      <div className="auth-section">
        <form onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@electromart.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-submit">
            Sign In
          </button>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;