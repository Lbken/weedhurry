import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const OrderDetails = ({ order }) => {
  const [message, setMessage] = useState('');

  const sendNotification = async () => {
    try {
      await axios.post(`/api/orders/${order._id}/notify`, { message });
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <div>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>

      <h3>Send Notification</h3>
      <Form>
        <Form.Group>
          <Form.Label>Message</Form.Label>
          <Form.Control
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
          />
        </Form.Group>
        <Button onClick={sendNotification}>Send</Button>
      </Form>
    </div>
  );
};

export default OrderDetails;
