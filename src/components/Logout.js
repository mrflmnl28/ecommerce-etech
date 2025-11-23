import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;