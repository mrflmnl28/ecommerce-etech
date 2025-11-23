import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // Import API helper

const Cart = ({ cart, onRemoveFromCart, onClearCart }) => {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculate Total
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      // 1. Format data for Backend
      // Backend expects: items: [{ productId, qty, price }], total
      const orderItems = cart.map(item => ({
        productId: item._id, // Use _id from MongoDB product
        qty: 1, // Assuming 1 for now, unless you add quantity logic
        price: item.price
      }));

      const payload = {
        items: orderItems,
        total: subtotal
      };

      // 2. Send to API
      await API.post('/orders', payload);

      // 3. Success Handling
      alert('Order placed successfully!'); // You can replace with Toast later
      
      // You need to add a clearCart function in App.js to empty the cart after purchase
      if (onClearCart) onClearCart(); 
      
      navigate('/orders'); // Redirect to Order History
    } catch (error) {
      console.error(error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Shopping Cart</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Your cart is empty</p>
          <button 
            className="btn-submit" 
            onClick={() => navigate('/shop')}
            style={{ marginTop: '1rem' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Shopping Cart ({cart.length} items)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Cart Items List */}
        <div>
          {cart.map(item => (
            <div key={item.cartId} className="cart-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {item.image && (
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                )}
                <div>
                    <h4>{item.name}</h4>
                    <p className="text-muted">${item.price}</p>
                </div>
              </div>
              <button 
                className="btn-delete"
                onClick={() => onRemoveFromCart(item.cartId)}
              >
                Cancel Order
              </button>
            </div>
          ))}
        </div>

        {/* Summary Box */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--accent-color)', paddingTop: '1rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button 
            className="btn-submit" 
            onClick={handleCheckout}
            disabled={isCheckingOut}
            style={{ marginTop: '1rem', width: '100%', opacity: isCheckingOut ? 0.7 : 1 }}
          >
            {isCheckingOut ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;