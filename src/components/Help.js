import React, { useState } from 'react';

// --- TEAM IMAGES ---
// Based on your file list, ensure these 4 images exist in 'src/assets/'
import imgAaron from '../assets/AaronFaustino.jpg';
import imgAngelo from '../assets/AngeloDavid.jpg';
import imgMarfil from '../assets/marfil.jpg';
import imgKenneth from '../assets/KennethAllen.jpg';

const Help = () => {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="admin-container">
      <div className="admin-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Help & Support Center</h2>
        <p style={{ color: '#666' }}>Learn how to use E-Tech Store and meet the team behind it.</p>
      </div>

      {/* --- 1. SYSTEM GUIDE SECTION --- */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '3rem' }}>
        
        {/* Guide Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '2rem' }}>
          <button 
            style={{ ...tabStyle, borderBottom: activeTab === 'user' ? '3px solid #333' : 'none', fontWeight: activeTab === 'user' ? 'bold' : 'normal' }}
            onClick={() => setActiveTab('user')}
          >
            User Guide
          </button>
          <button 
            style={{ ...tabStyle, borderBottom: activeTab === 'admin' ? '3px solid #333' : 'none', fontWeight: activeTab === 'admin' ? 'bold' : 'normal' }}
            onClick={() => setActiveTab('admin')}
          >
            Admin Instructions
          </button>
        </div>

        {/* USER GUIDE CONTENT */}
        {activeTab === 'user' && (
          <div className="guide-content">
            <h3>🛍️ Purpose of E-Tech Store</h3>
            <p>E-Tech Store is your premium destination for high-performance PC builds, laptops, and computer parts. Our goal is to provide a seamless shopping experience for tech enthusiasts.</p>
            
            <h3 style={{ marginTop: '2rem' }}>🚀 How to Use the System</h3>
            <ol style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
              <li><strong>Create an Account:</strong> Click "Register" to create your personal profile.</li>
              <li><strong>Browse Products:</strong> Visit the "Shop" page. You can filter by category (Laptops, Parts, etc.) or search by name.</li>
              <li><strong>Add to Cart:</strong> Found something you like? Click "Add to Cart". Your cart is saved automatically!</li>
              <li><strong>Checkout:</strong> Go to your Cart and click "Place Order". Your order will be sent to our database.</li>
              <li><strong>Track Orders:</strong> Visit the "Orders" page to see the status of your purchase (Pending, Shipped, Delivered).</li>
              <li><strong>Manage Profile:</strong> Update your email or password in the "Profile" section.</li>
            </ol>
          </div>
        )}

        {/* ADMIN GUIDE CONTENT */}
        {activeTab === 'admin' && (
          <div className="guide-content">
            <h3>🛡️ Admin Dashboard Instructions</h3>
            <p>As an administrator, you have full control over the store's inventory and orders.</p>

            <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={stepCardStyle}>
                <h4>1. Manage Products</h4>
                <p>Go to <strong>Manage Products</strong> to Add, Edit, or Delete items. You can upload image URLs, set prices, and manage stock levels.</p>
              </div>

              <div style={stepCardStyle}>
                <h4>2. Manage Orders (Crucial)</h4>
                <p>Go to <strong>Manage Orders</strong> to process customer purchases.</p>
                <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <li><strong>Pending:</strong> Review the order. Click "Approve" to mark as Paid or "Cancel" to reject.</li>
                  <li><strong>Paid:</strong> Once packed, click "Ship Order".</li>
                  <li><strong>Shipped:</strong> Once it arrives, click "Mark Delivered".</li>
                </ul>
              </div>

              <div style={stepCardStyle}>
                <h4>3. Manage Categories</h4>
                <p>Create new product categories (e.g., "Keyboards", "Monitors") to organize your shop better.</p>
              </div>

              <div style={stepCardStyle}>
                <h4>4. Manage Users</h4>
                <p>View all registered users. You can remove suspicious accounts if necessary.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- 2. MEET THE TEAM SECTION --- */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>Meet the Developers</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          
          {/* MEMBER 1: John Aaron */}
          <div style={memberCardStyle}>
            <img 
                src={imgAaron} 
                alt="John Aaron" 
                style={imageStyle}
                onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} 
            />
            <div style={{...imagePlaceholderStyle, display: 'none'}}>
               <span style={{fontSize: '3rem'}}>📄</span>
            </div>
            <h3>John Aaron</h3>
            <p style={roleStyle}>Documentation</p>
          </div>

          {/* MEMBER 2: Angelo David */}
          <div style={memberCardStyle}>
            <img 
                src={imgAngelo} 
                alt="Angelo David" 
                style={imageStyle}
                onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} 
            />
            <div style={{...imagePlaceholderStyle, display: 'none'}}>
               <span style={{fontSize: '3rem'}}>🎨</span>
            </div>
            <h3>Angelo David</h3>
            <p style={roleStyle}>UI/UX Designer</p>
          </div>

          {/* MEMBER 3: Marfil */}
          <div style={memberCardStyle}>
            <img 
                src={imgMarfil} 
                alt="Marfil" 
                style={imageStyle}
                onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} 
            />
            <div style={{...imagePlaceholderStyle, display: 'none'}}>
               <span style={{fontSize: '3rem'}}>💻</span>
            </div>
            <h3>Marfil</h3>
            <p style={roleStyle}>Frontend Developer</p>
          </div>

          {/* MEMBER 4: Kenneth Allen */}
          <div style={memberCardStyle}>
            <img 
                src={imgKenneth} 
                alt="Kenneth Allen" 
                style={imageStyle}
                onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} 
            />
            <div style={{...imagePlaceholderStyle, display: 'none'}}>
               <span style={{fontSize: '3rem'}}>⚙️</span>
            </div>
            <h3>Kenneth Allen</h3>
            <p style={roleStyle}>Backend Developer</p>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const tabStyle = {
  padding: '1rem 2rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.1rem',
  color: '#333',
  outline: 'none',
  transition: 'all 0.3s'
};

const stepCardStyle = {
  padding: '1rem',
  backgroundColor: '#f9f9f9',
  borderLeft: '4px solid #333',
  borderRadius: '4px'
};

const memberCardStyle = {
  background: 'white',
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  textAlign: 'center',
  transition: 'transform 0.3s',
  cursor: 'pointer'
};

const roleStyle = {
  color: '#666',
  fontWeight: 'bold',
  marginTop: '0.5rem',
  textTransform: 'uppercase',
  fontSize: '0.85rem',
  letterSpacing: '1px'
};

const imageStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '1rem',
  border: '3px solid #f0f0f0',
  margin: '0 auto 1rem auto',
  display: 'block'
};

const imagePlaceholderStyle = {
  width: '120px',
  height: '120px',
  backgroundColor: '#eee',
  borderRadius: '50%',
  margin: '0 auto 1rem auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default Help;