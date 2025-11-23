import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import API from './api'; 

// Components
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import Cart from './components/Cart';
import Order from './components/Order';
import Profile from './components/Profile';
import Logout from './components/Logout';
import Help from './components/Help';

// Admin Components
import ManageCategories from './components/Admin/ManageCategories';
import ManageProduct from './components/Admin/ManageProduct';
import ManageUser from './components/Admin/ManageUser';
import ManageOrder from './components/Admin/ManageOrder'; // <--- ADDED IMPORT

import './App.css';

function App() {
  // 1. AUTH STATE (Lazy Load)
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('role') === 'admin');
  
  // 2. CART STATE (Persistent)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]); 

  // Notification State
  const [notification, setNotification] = useState({ message: '', type: '' });

  // 3. PERSIST CART
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 4. AUTO-HIDE NOTIFICATION
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Helper to show toast
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // 5. FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // 6. CART HANDLERS
  const addToCart = (product) => {
    setCart(prevCart => [...prevCart, { ...product, cartId: Date.now() }]);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    showToast('Item removed from cart.', 'success');
  };

  const clearCart = () => {
    setCart([]);
  };

  // 7. AUTH HANDLERS
  const handleLogin = (role) => {
    setIsLoggedIn(true);
    if (role === 'admin') {
      setIsAdminLoggedIn(true);
    }
    showToast('Successfully logged in!', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
    setCart([]); 
    showToast('Logged out successfully.', 'success');
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App" style={{ position: 'relative' }}>
        
        {/* --- GLOBAL TOAST NOTIFICATION --- */}
        {notification.message && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: notification.type === 'error' ? '#ff4d4f' : '#4caf50',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease-in-out',
            fontWeight: 'bold'
          }}>
            {notification.message}
          </div>
        )}

        <Navbar 
          isLoggedIn={isLoggedIn} 
          isAdminLoggedIn={isAdminLoggedIn} 
          cartCount={cart.length}
          onLogout={handleLogout}
        />
        
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Navigate to="/shop" replace />} />
          
          <Route path="/login" element={
            isLoggedIn ? <Navigate to={isAdminLoggedIn ? "/admin/products" : "/shop"} /> : <Login onLoginSuccess={handleLogin} />
          } />
          
          <Route path="/register" element={
            isLoggedIn ? <Navigate to="/shop" /> : <Register onLoginSuccess={handleLogin} />
          } />
          
          <Route path="/shop" element={<Shop products={products} onAddToCart={addToCart} />} />
          
          <Route path="/help" element={<Help />} />

          {/* --- USER PROTECTED ROUTES --- */}
          <Route path="/cart" element={
            isLoggedIn ? (
              <Cart 
                cart={cart} 
                onRemoveFromCart={removeFromCart} 
                onClearCart={clearCart} 
              /> 
            ) : <Navigate to="/login" />
          } />
          
          <Route path="/orders" element={
            isLoggedIn ? <Order /> : <Navigate to="/login" />
          } />
          
          <Route path="/profile" element={
            isLoggedIn ? <Profile /> : <Navigate to="/login" />
          } />
          
          <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
          
          {/* --- ADMIN PROTECTED ROUTES --- */}
          <Route path="/admin/categories" element={
            isAdminLoggedIn ? <ManageCategories /> : <Navigate to="/login" />
          } />
          
          <Route path="/admin/products" element={
            isAdminLoggedIn ? <ManageProduct products={products} /> : <Navigate to="/login" />
          } />
          
          <Route path="/admin/users" element={
            isAdminLoggedIn ? <ManageUser users={users} /> : <Navigate to="/login" />
          } />

          <Route path="/admin/orders" element={
            isAdminLoggedIn ? <ManageOrder /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;