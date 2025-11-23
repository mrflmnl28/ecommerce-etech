import React, { useState, useEffect } from 'react';
import API from '../../api';

const ManageUser = () => {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Action States
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // For Editing
  
  // Form Data
  const [formData, setFormData] = useState({ username: '', email: '', role: 'user' });
  
  // Notification
  const [notification, setNotification] = useState({ message: '', type: '' });

  // --- EFFECTS ---
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- API CALLS ---
  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/auth');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  // --- HELPERS ---
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // --- EDIT HANDLERS ---
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({ 
        username: user.username, 
        email: user.email, 
        role: user.role 
    });
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/auth/${currentUser._id}`, formData);
      
      // Update local list
      setUsers(users.map(u => u._id === currentUser._id ? data : u));
      
      showToast('User updated successfully!', 'success');
      setShowEditModal(false);
      setCurrentUser(null);
    } catch (error) {
      showToast('Failed to update user.', 'error');
    }
  };

  // --- DELETE HANDLERS ---
  const confirmDelete = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteProceed = async () => {
    if (!userToDelete) return;
    try {
      await API.delete(`/auth/${userToDelete}`);
      setUsers(users.filter(u => u._id !== userToDelete));
      showToast('User removed successfully.', 'success');
    } catch (error) {
      showToast('Failed to remove user.', 'error');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // --- FILTER LOGIC ---
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.username.toLowerCase().includes(searchLower) || 
      user.email.toLowerCase().includes(searchLower);

    return matchesRole && matchesSearch;
  });

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
        <h2>Manage Users</h2>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div style={{ 
        marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', 
        borderRadius: '8px', display: 'flex', gap: '1rem', flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ minWidth: '150px' }}>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All Roles</option>
            <option value="user">Customers (User)</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* --- USERS TABLE --- */}
      <div className="products-table-container">
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No users found matching your filters.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user._id.substring(0, 6)}...</td>
                  <td style={{ fontWeight: 'bold' }}>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem',
                        background: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                        color: user.role === 'admin' ? '#1976d2' : '#616161',
                        fontWeight: 'bold',
                        border: user.role === 'admin' ? '1px solid #90caf9' : '1px solid #e0e0e0'
                    }}>
                        {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => handleEditClick(user)}>
                        Edit
                    </button>
                    {user.role !== 'admin' ? (
                        <button className="btn-action delete" onClick={() => confirmDelete(user._id)}>
                            Remove
                        </button>
                    ) : (
                        <span style={{ color: '#ccc', fontSize: '0.9rem', marginLeft: '10px' }}>Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- EDIT USER MODAL --- */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowEditModal(false)}>&times;</span>
            <h3>Edit User</h3>
            <form onSubmit={handleUpdateSubmit}>
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
                <label>Email</label>
                <input 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                    <option value="user">User (Customer)</option>
                    <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-submit">Update User</button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="modal" style={{ zIndex: 2500 }}>
            <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
                <h3>Remove User?</h3>
                <p>Are you sure you want to remove this user? They will no longer be able to log in.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button className="btn-action" onClick={() => setShowDeleteModal(false)} style={{ padding: '0.5rem 1.5rem', background: '#ccc', color: '#333' }}>Cancel</button>
                    <button className="btn-action delete" onClick={handleDeleteProceed} style={{ padding: '0.5rem 1.5rem' }}>Yes, Remove</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ManageUser;