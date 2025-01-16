// VendorDashboardOrders.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VendorDashboardOrders = ({ vendorId }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/api/vendors/${vendorId}/orders`);
        setOrders(response.data.orders);
      } catch (error) {
        setError('Failed to load orders');
      }
    };

    fetchOrders();
  }, [vendorId]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order))
      );
    } catch (error) {
      console.error('Failed to update order status');
    }
  };

  return (
    <div>
      <h2>Order List</h2>
      {error && <p>{error}</p>}
      {orders.map((order) => (
        <div key={order._id}>
          <h4>Order {order._id}</h4>
          <p>Status: {order.status}</p>
          <button onClick={() => updateOrderStatus(order._id, 'Processing')}>Mark as Processing</button>
          <button onClick={() => updateOrderStatus(order._id, 'Completed')}>Mark as Completed</button>
        </div>
      ))}
    </div>
  );
};

export default VendorDashboardOrders;
