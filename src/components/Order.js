import React, { useState, useEffect } from 'react';
import API from '../api';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // We need the User ID to fetch their specific orders
        // We stored the user object in localStorage during login
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Call the backend endpoint: /orders/user/:id
          const { data } = await API.get(`/orders/user/${user._id}`);
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div className="admin-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <p>No orders yet.</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontSize: '0.9rem', color: '#666' }}>
                    #{order._id.substring(0, 8)}...
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {/* Show first item name + count of others */}
                    {order.items.length > 0 && (
                        <span>
                            {order.items[0].productId?.name || 'Unknown Item'}
                            {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                        </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    ${order.total}
                  </td>
                  <td>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: 
                            order.status === 'Paid' ? '#d4edda' : 
                            order.status === 'Pending' ? '#fff3cd' : '#f8d7da',
                        color: 
                            order.status === 'Paid' ? '#155724' : 
                            order.status === 'Pending' ? '#856404' : '#721c24'
                    }}>
                        {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Order;