import React, { useState, useEffect } from 'react';
import API from '../../api';

const ManageCategories = () => {
  // --- STATE ---
  const [categories, setCategories] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('az'); // Default: A-Z

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [currentCatId, setCurrentCatId] = useState(null);
  const [catToDelete, setCatToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Notification State
  const [notification, setNotification] = useState({ message: '', type: '' });

  // --- EFFECTS ---
  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- API CALLS ---
  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  // --- HELPERS ---
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setIsEditing(false);
    setCurrentCatId(null);
  };

  // --- HANDLERS ---
  const handleAddClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (cat) => {
    setIsEditing(true);
    setCurrentCatId(cat._id);
    setFormData({ name: cat.name, description: cat.description });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // UPDATE
        const { data } = await API.put(`/categories/${currentCatId}`, formData);
        setCategories(categories.map(c => c._id === currentCatId ? data : c));
        showToast('Category updated successfully!', 'success');
      } else {
        // CREATE
        const { data } = await API.post('/categories', formData);
        setCategories([...categories, data]);
        showToast('Category created successfully!', 'success');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      showToast('Error saving category.', 'error');
    }
  };

  const confirmDelete = (id) => {
    setCatToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteProceed = async () => {
    if (!catToDelete) return;
    try {
      await API.delete(`/categories/${catToDelete}`);
      setCategories(categories.filter(c => c._id !== catToDelete));
      showToast('Category deleted successfully.', 'success');
    } catch (error) {
      showToast('Failed to delete. Used by existing products?', 'error');
    } finally {
      setShowDeleteModal(false);
      setCatToDelete(null);
    }
  };

  // --- SEARCH & FILTER LOGIC ---
  const getProcessedCategories = () => {
    // 1. Search Filter
    let processed = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sorting Logic
    processed.sort((a, b) => {
      if (sortOption === 'az') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'za') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return processed;
  };

  const displayedCategories = getProcessedCategories();

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
        <h2>Manage Categories</h2>
        <button className="btn-submit" onClick={handleAddClick}>
          Add New Category
        </button>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div style={{ 
        marginBottom: '1rem', 
        padding: '1rem', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Sort Dropdown */}
        <div style={{ minWidth: '150px' }}>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="az">Name (A-Z)</option>
            <option value="za">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="products-table-container">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {displayedCategories.length > 0 ? (
                    displayedCategories.map(cat => (
                        <tr key={cat._id}>
                            <td style={{ fontWeight: 'bold' }}>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>
                                <button className="btn-action" onClick={() => handleEditClick(cat)}>
                                    Edit
                                </button>
                                <button className="btn-action delete" onClick={() => confirmDelete(cat._id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No categories found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* --- MODAL: ADD / EDIT --- */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h3>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn-submit">
                {isEditing ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE CONFIRMATION --- */}
      {showDeleteModal && (
        <div className="modal" style={{ zIndex: 2500 }}>
            <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
                <h3>Are you sure?</h3>
                <p>Do you really want to delete this category?</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button className="btn-action" onClick={() => setShowDeleteModal(false)} style={{ padding: '0.5rem 1.5rem', background: '#ccc', color: '#333' }}>Cancel</button>
                    <button className="btn-action delete" onClick={handleDeleteProceed} style={{ padding: '0.5rem 1.5rem' }}>Yes, Delete</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ManageCategories;