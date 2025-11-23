import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, isAdminLoggedIn, cartCount, onLogout }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1. Triggered when user clicks "Logout" button
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // 2. Triggered when user clicks "Yes, Logout" in the modal
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout(); // Clears state and localStorage (from App.js)
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1 className="logo" onClick={() => navigate('/shop')}>E-Tech</h1>
          </div>

          <ul className="nav-links">
            <li><Link to="/shop" className="nav-link">Shop</Link></li>
            
{isAdminLoggedIn ? (
  <>
    <li><Link to="/admin/orders" className="nav-link">Manage Orders</Link></li>
    <li><Link to="/admin/products" className="nav-link">Manage Products</Link></li>
    <li><Link to="/admin/categories" className="nav-link">Manage Categories</Link></li>
    <li><Link to="/admin/users" className="nav-link">Manage Users</Link></li>
  </>
) : (

              <>
                {isLoggedIn && (
                  <>
                    <li><Link to="/cart" className="nav-link">🛒 Cart <span className="cart-count">{cartCount}</span></Link></li>
                    <li><Link to="/orders" className="nav-link">Orders</Link></li>
                    <li><Link to="/profile" className="nav-link">Profile</Link></li>
                  </>
                )}
              </>
            )}
            
            <li><Link to="/help" className="nav-link">Help</Link></li>
            
            {isLoggedIn ? (
              // CHANGED: Now calls handleLogoutClick instead of directly logging out
              <li>
                <button 
                  onClick={handleLogoutClick} 
                  className="nav-link" 
                  style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem'}}
                >
                  Logout
                </button>
              </li>
            ) : (
              <li><Link to="/login" className="nav-link">Login</Link></li>
            )}
          </ul>
        </div>
      </nav>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div className="modal" style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
            <span className="close" onClick={() => setShowLogoutModal(false)}>&times;</span>
            
            <h3>Sign Out</h3>
            <p style={{ margin: '1rem 0' }}>Are you sure you want to log out?</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button 
                className="btn-action" 
                onClick={() => setShowLogoutModal(false)}
                style={{ padding: '0.5rem 1.5rem', background: '#ccc', color: '#333', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="btn-action delete" 
                onClick={handleConfirmLogout}
                style={{ padding: '0.5rem 1.5rem', background: '#d9534f', color: 'white', cursor: 'pointer' }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;