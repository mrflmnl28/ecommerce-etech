import React, { useState, useEffect } from 'react';
import API from '../../api';

const ManageProduct = ({ products }) => {
  // --- STATE MANAGEMENT ---
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // EDIT MODE STATE
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const [productToDelete, setProductToDelete] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // DATA STATE
  const [categories, setCategories] = useState([]);
  const [localProducts, setLocalProducts] = useState(products);
  
  // NEW: FILTER STATE
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    image: ''
  });

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // --- RESET FORM ---
  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', brand: '', category: '', image: '' });
    setIsEditing(false);
    setCurrentProductId(null);
  };

  // --- OPEN HANDLERS ---
  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setCurrentProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      brand: product.brand,
      category: product.category?._id || product.category || '', 
      image: product.image
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SUBMIT HANDLERS ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { data } = await API.put(`/products/${currentProductId}`, formData);
        setLocalProducts(localProducts.map(p => p._id === currentProductId ? data : p));
        showToast('Product updated successfully!', 'success');
      } else {
        const { data } = await API.post('/products', formData);
        setLocalProducts([...localProducts, data]);
        showToast('Product created successfully!', 'success');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      showToast(isEditing ? 'Error updating product.' : 'Error creating product.', 'error');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/categories', newCategory);
      setCategories([...categories, data]);
      setFormData({ ...formData, category: data._id });
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      showToast(`Category "${data.name}" created!`, 'success');
    } catch (error) {
      showToast('Error creating category.', 'error');
    }
  };

  const confirmDelete = (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteProceed = async () => {
    if (!productToDelete) return;
    try {
      await API.delete(`/products/${productToDelete}`);
      setLocalProducts(localProducts.filter(p => p._id !== productToDelete));
      showToast('Product deleted successfully.', 'success');
    } catch (error) {
      showToast('Failed to delete product.', 'error');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const getCategoryName = (product) => {
    if (product.category && product.category.name) return product.category.name;
    return 'General';
  };

  // --- FILTER LOGIC ---
  const filteredProducts = localProducts.filter(product => {
    if (filterCategory === 'all') return true;
    // Handle case where category is an object (populated) OR just an ID string
    const productCatId = product.category?._id || product.category;
    return productCatId === filterCategory;
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
        <h2>Manage Products</h2>
        <button className="btn-submit" onClick={handleAddClick}>
          Add New Product
        </button>
      </div>

      {/* --- NEW: FILTER BAR --- */}
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>Filter by Category:</label>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>
          Showing {filteredProducts.length} products
        </span>
      </div>

      <div className="products-table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* USE filteredProducts INSTEAD OF localProducts */}
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product._id || product.id}>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>{getCategoryName(product)}</td>
                  <td>
                    <button className="btn-action" onClick={() => handleEditClick(product)}>
                      Edit
                    </button>
                    <button className="btn-action delete" onClick={() => confirmDelete(product._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No products found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODALS (Add/Edit, New Category, Delete) --- */}
      
      {/* MAIN MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h3>{isEditing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group">
                    <label>Price</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Stock</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select name="category" value={formData.category} onChange={handleChange} required style={{ flex: 1 }}>
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    <button type="button" className="btn-submit" style={{ margin: 0, width: 'auto', padding: '0 1rem' }} onClick={() => setShowCategoryModal(true)}>+</button>
                </div>
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input name="brand" value={formData.brand} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" name="image" value={formData.image} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn-submit">
                {isEditing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="modal" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-content" style={{ width: '400px', marginTop: '15%' }}>
                <span className="close" onClick={() => setShowCategoryModal(false)}>&times;</span>
                <h3>New Category</h3>
                <form onSubmit={handleCategorySubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input value={newCategory.description} onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} />
                    </div>
                    <button type="submit" className="btn-submit">Create & Select</button>
                </form>
            </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal" style={{ zIndex: 2500 }}>
            <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
                <h3>Are you sure?</h3>
                <p>Do you really want to delete this product?</p>
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

export default ManageProduct;