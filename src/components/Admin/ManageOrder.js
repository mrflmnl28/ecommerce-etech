import React, { useState, useEffect } from 'react';
import API from '../../api';

const ManageOrder = () => {
  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('All');

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionDetails, setActionDetails] = useState({ id: null, status: '' });

  // Notification State
  const [notification, setNotification] = useState({ message: '', type: '' });

  // --- TABS CONFIGURATION ---
  const tabs = ['All', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  // --- EFFECTS ---
  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- API CALLS ---
  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107'; // Yellow
      case 'Paid': return '#17a2b8';    // Blue
      case 'Shipped': return '#6610f2'; // Purple
      case 'Delivered': return '#28a745'; // Green
      case 'Cancelled': return '#dc3545'; // Red
      case 'Returned': return '#6c757d';  // Grey
      default: return '#333';
    }
  };

  // --- BUTTON STYLING (NEW) ---
  const commonBtnStyle = {
    width: '140px',       // Fixed width for all buttons
    textAlign: 'center',
    justifyContent: 'center',
    fontWeight: '600',    // Bold font
    fontSize: '0.85rem',  // Consistent size
    fontFamily: 'inherit', // Matches App font
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem'
  };

  // --- HANDLERS ---
  const handleStatusClick = (id, newStatus) => {
    setActionDetails({ id, status: newStatus });
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      const { id, status } = actionDetails;
      const { data } = await API.put(`/orders/status/${id}`, { status });
      setOrders(orders.map(order => order._id === id ? data : order));
      showToast(`Order marked as ${status}`, 'success');
    } catch (error) {
      showToast('Failed to update order status', 'error');
    } finally {
      setShowConfirmModal(false);
    }
  };

  // --- FILTERING ---
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    return order.status === activeTab;
  });

  return (
    <div className="admin-container" style={{ position: 'relative' }}>
      
      {/* TOAST NOTIFICATION */}
      {notification.message && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px',
          backgroundColor: notification.type === 'error' ? '#ff4d4f' : '#4caf50',
          color: 'white', padding: '1rem 2rem', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 3000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {notification.message}
        </div>
      )}

      <div className="admin-header">
        <h2>Manage Orders</h2>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        overflowX: 'auto', 
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: activeTab === tab ? '#333' : '#f0f0f0',
              color: activeTab === tab ? 'white' : '#555',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- ORDERS TABLE --- */}
      <div className="products-table-container">
        {loading ? (
            <p>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>No orders found in this tab.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontSize: '0.85rem', color: '#666' }}>#{order._id.substring(0, 6)}...</td>
                  
                  <td style={{ fontWeight: 'bold' }}>
                    {order.user?.username || 'Unknown User'}
                    <br/>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666' }}>
                        {order.user?.email}
                    </span>
                  </td>
                  
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 'bold' }}>${order.total}</td>
                  
                  <td>
                    <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        color: 'white', 
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: getStatusColor(order.status),
                        display: 'inline-block',
                        minWidth: '80px',
                        textAlign: 'center'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        
                        {order.status === 'Pending' && (
                            <>
                                <button 
                                    className="btn-action" 
                                    style={{ ...commonBtnStyle, backgroundColor: '#28a745', color: 'white', border: 'none' }}
                                    onClick={() => handleStatusClick(order._id, 'Paid')}
                                >
                                    Approve (Paid)
                                </button>
                                <button 
                                    className="btn-action delete" 
                                    style={{ ...commonBtnStyle }} // Reuses width, but keeps delete styling
                                    onClick={() => handleStatusClick(order._id, 'Cancelled')}
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {order.status === 'Paid' && (
                            <button 
                                className="btn-action" 
                                style={{ ...commonBtnStyle, backgroundColor: '#6610f2', color: 'white', border: 'none' }}
                                onClick={() => handleStatusClick(order._id, 'Shipped')}
                            >
                                Ship Order
                            </button>
                        )}

                        {order.status === 'Shipped' && (
                            <button 
                                className="btn-action" 
                                style={{ ...commonBtnStyle, backgroundColor: '#28a745', color: 'white', border: 'none' }}
                                onClick={() => handleStatusClick(order._id, 'Delivered')}
                            >
                                Mark Delivered
                            </button>
                        )}

                        {order.status === 'Delivered' && (
                            <button 
                                className="btn-action" 
                                style={{ ...commonBtnStyle, backgroundColor: '#6c757d', color: 'white', border: 'none' }}
                                onClick={() => handleStatusClick(order._id, 'Returned')}
                            >
                                Process Return
                            </button>
                        )}

                        {(order.status === 'Cancelled' || order.status === 'Returned') && (
                            <span style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic', padding: '0.5rem' }}>
                                No actions available
                            </span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="modal" style={{ zIndex: 3500 }}>
            <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
                <h3>Update Status?</h3>
                <p>
                    Mark order as 
                    <strong style={{ color: getStatusColor(actionDetails.status), marginLeft: '5px' }}>
                        {actionDetails.status.toUpperCase()}
                    </strong>?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button 
                        className="btn-action" 
                        onClick={() => setShowConfirmModal(false)}
                        style={{ padding: '0.7rem 1.5rem', background: '#ccc', color: '#333', fontWeight: 'bold' }}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn-action" 
                        onClick={confirmStatusChange}
                        style={{ padding: '0.7rem 1.5rem', background: '#333', color: 'white', fontWeight: 'bold' }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ManageOrder;