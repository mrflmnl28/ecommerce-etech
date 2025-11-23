import React, { useState, useEffect } from 'react';
import API from '../api'; 

// IMPORT THE IMAGE
// Ensure you have the image at this path
import shopHeroBg from '../assets/2.jpg';

const Shop = ({ products, onAddToCart }) => {
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // --- FETCH CATEGORIES ON LOAD ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(product => {
    // 1. Search Logic
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Category Filter Logic
    let matchesFilter = false;
    if (filter === 'all') {
      matchesFilter = true;
    } else {
      // Compare ID strings
      const productCategoryId = product.category?._id || product.category;
      matchesFilter = productCategoryId === filter;
    }

    return matchesFilter && matchesSearch;
  });

  const getProductImage = (product) => {
    return product.image || '';
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero" style={{
        backgroundImage: `url(${shopHeroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.6)'
      }}>
        {/* Dark Overlay */}
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1
        }}></div>

        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <h2>Build Your Perfect Setup</h2>
          <p style={{ color: '#eee' }}>Discover premium PC builds and high-performance hardware</p>
          
          {/* --- DYNAMIC CATEGORY BUTTONS --- */}
          <div className="hero-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {/* Always show "Shop All" */}
            <button 
              className={filter === 'all' ? 'btn-primary' : 'btn-secondary'} 
              onClick={() => setFilter('all')}
            >
              Shop All
            </button>
            
            {/* Map ALL categories from Database to Buttons */}
            {categories.map(cat => (
              <button 
                key={cat._id}
                className={filter === cat._id ? 'btn-primary' : 'btn-secondary'} 
                onClick={() => setFilter(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <h3>{filter === 'all' ? 'All Products' : 'Filtered Results'}</h3>
        
        {/* SEARCH & FILTER BAR */}
        <div style={{ 
          display: 'flex', gap: '1rem', marginBottom: '2rem', 
          flexWrap: 'wrap', alignItems: 'center',
          backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px'
        }}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.75rem 1rem', border: '1px solid #ccc', borderRadius: '4px', flex: '1', minWidth: '250px' }}
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.75rem 1rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}
          >
            <option value="all">All Categories</option>
            {loading ? (
              <option disabled>Loading categories...</option>
            ) : (
              categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))
            )}
          </select>
        </div>

        {/* PRODUCTS GRID */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id || product.id} className="product-card">
              <div className="product-image">
                {getProductImage(product) ? (
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="product-image-placeholder" style={{ background: 'var(--neutral-100)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No Image
                  </div>
                )}
              </div>
              <div className="product-content">
                <h4 className="product-name">{product.name}</h4>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', color: '#666', marginBottom: '0.5rem', display: 'inline-block' }}>
                    {product.category?.name || 'General'}
                </span>
                <p className="product-specs">
                    {product.description ? product.description.substring(0, 50) + '...' : 'No description'}
                </p>
                <div className="product-price">${product.price}</div>
                <button className="add-to-cart" onClick={() => onAddToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No products found.</p>
            <button className="btn-secondary" onClick={() => { setFilter('all'); setSearchTerm(''); }}>
                Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;