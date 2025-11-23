import React, { useState, useEffect } from 'react';
import API from '../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '' // Optional new password
  });
  
  // Notification
  const [notification, setNotification] = useState({ message: '', type: '' });

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch User Profile
      const { data: userData } = await API.get('/auth/me');
      setUser(userData);
      setFormData({ 
        username: userData.username, 
        email: userData.email, 
        password: '' 
      });

      // 2. Fetch User Orders (For Stats)
      const { data: orderData } = await API.get(`/orders/user/${userData._id}`);
      setOrders(orderData);
    } catch (error) {
      console.error("Error loading profile data", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULATE STATS ---
  const calculateStats = () => {
    const totalOrders = orders.length;
    
    // Pending Amount: Sum of orders that are 'Pending'
    const pendingAmount = orders
      .filter(o => o.status === 'Pending')
      .reduce((sum, o) => sum + o.total, 0);

    // Total Spent: Sum of orders that are NOT Cancelled or Returned
    const totalSpent = orders
      .filter(o => !['Cancelled', 'Returned', 'Pending'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);

    return { totalOrders, pendingAmount, totalSpent };
  };

  const stats = calculateStats();

  // --- HANDLERS ---
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
      };
      // Only send password if user typed something
      if (formData.password) {
        payload.password = formData.password;
      }

      const { data } = await API.put('/auth/profile', payload);
      
      setUser(data); // Update local user view
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
      
      // Clear password field for security
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      showToast('Failed to update profile.', 'error');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="admin-container" style={{ position: 'relative' }}>
      
      {/* TOAST NOTIFICATION */}
      {notification.message && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px',
          backgroundColor: notification.type === 'error' ? '#ff4d4f' : '#4caf50',
          color: 'white', padding: '1rem 2rem', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 3000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {notification.message}
        </div>
      )}

      <div className="admin-header">
        <h2>My Profile</h2>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div style={statCardStyle}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Orders</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalOrders}</div>
        </div>
        <div style={statCardStyle}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Payment</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f0ad4e' }}>
                ${stats.pendingAmount.toFixed(2)}
            </div>
        </div>
        <div style={statCardStyle}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Spent</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5cb85c' }}>
                ${stats.totalSpent.toFixed(2)}
            </div>
        </div>
      </div>

      {/* --- PROFILE DETAILS / EDIT FORM --- */}
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        maxWidth: '600px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Account Details</h3>
            {!isEditing && (
                <button className="btn-action" onClick={() => setIsEditing(true)}>
                    Edit Profile
                </button>
            )}
        </div>

        {isEditing ? (
            <form onSubmit={handleUpdate}>
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password <span style={{fontWeight:'normal', color:'#888'}}>(Leave blank to keep current)</span></label>
                    <input 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••"
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn-submit">Save Changes</button>
                    <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({ 
                                username: user.username, 
                                email: user.email, 
                                password: '' 
                            });
                        }}
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        ) : (
            <>
                <div className="form-group">
                    <label style={{ color: '#888', fontSize: '0.9rem' }}>Username</label>
                    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontSize: '1.1rem', fontWeight: '500' }}>
                        {user.username}
                    </div>
                </div>
                
                <div className="form-group">
                    <label style={{ color: '#888', fontSize: '0.9rem' }}>Email Address</label>
                    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontSize: '1.1rem', fontWeight: '500' }}>
                        {user.email}
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ color: '#888', fontSize: '0.9rem' }}>Account Role</label>
                    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontSize: '1.1rem', fontWeight: '500' }}>
                        {user.role.toUpperCase()}
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ color: '#888', fontSize: '0.9rem' }}>Member Since</label>
                    <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', fontSize: '1.1rem', fontWeight: '500' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

// Simple inline styles for the stats cards
const statCardStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    textAlign: 'center'
};

export default Profile;