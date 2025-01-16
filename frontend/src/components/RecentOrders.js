import React, { useState, useEffect, useContext } from 'react';
import { Badge, Toast, Card, ListGroup } from 'react-bootstrap';
import api from '../api/api';  // Update path as needed
import { AuthContext } from '../context/AuthContext';

const RecentOrders = () => {
  const { auth } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth?.vendorId) {
        console.error('Vendor ID is not defined in AuthContext');
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await api.get(`/api/orders/vendor/${auth.vendorId}`);
        setOrders(response.data || []);
      } catch (error) {
        console.error('Error fetching vendor orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchOrders();
  }, [auth]);

  const handleRowClick = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleStatusChange = async (orderId, status) => {
    try {
        console.log('Attempting to update order:', orderId, 'to status:', status);
        
        const response = await api.put(`/api/orders/${orderId}/status`, { status });
        
        console.log('Server response:', response.data);
        
        if (response.data.success) {
            // Update local state with the returned data
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? response.data.data : order
                )
            );
            
            setToastMessage(`Order successfully marked as ${status.toLowerCase()}`);
            setShowToast(true);
        } else {
            throw new Error(response.data.message || 'Failed to update order');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert(error.response?.data?.message || 'Failed to update order status');
    }
};

  const formatBirthdate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(`${type} copied to clipboard!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setToastMessage('Failed to copy to clipboard');
      setShowToast(true);
    }
  };

  const toastStyle = {
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    zIndex: 1050
  };

  const orderCardStyle = {
    marginBottom: '1rem',
    cursor: 'pointer',
    border: '1px solid #dee2e6',
    borderRadius: '0.375rem',
    transition: 'border-color 0.15s ease-in-out'
  };

  const imageStyle = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px'
  };

  const copyButtonStyle = {
    border: 'none',
    background: 'none',
    color: '#0d6efd',
    padding: '4px 8px',
    cursor: 'pointer'
  };

  return (
    <div className="bg-white p-4">
      <h2 className="mb-4">Recent Orders</h2>

      <div style={toastStyle}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Body className="bg-success text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>

      {orders.map((order) => (
        <Card key={order._id} style={orderCardStyle} onClick={() => handleRowClick(order._id)}>
          <Card.Body>
            {/* Order Header */}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
                <h6 className="mb-0">
                  {order.contactInfo?.firstName} {order.contactInfo?.lastName}
                </h6>
                <div className="mt-1">
                  <Badge bg={
                    order.status === 'COMPLETED' ? 'success' :
                    order.status === 'CANCELLED' ? 'danger' : 'warning'
                  } className="me-2">
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <Badge bg="info">{order.orderType}</Badge>
                </div>
              </div>
              <div className="text-end">
                <h5 className="mb-0">${order.total?.toFixed(2)}</h5>
                <small className="text-muted">{order.items.length} items</small>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedOrderId === order._id && (
              <div className="mt-3 pt-3 border-top">
                <div className="row">
                  {/* Customer Information */}
                  <div className="col-md-6 mb-3">
                    <div className="mb-3">
                      <h6 className="mb-2">Customer Information</h6>
                      <Card className="bg-light">
                        <Card.Body>
                          <p className="mb-1">{order.contactInfo?.firstName} {order.contactInfo?.lastName}</p>
                          <p className="mb-1 text-muted">DOB: {formatBirthdate(order.customer?.birthdate)}</p>
                          <p className="mb-1 text-muted">{order.contactInfo?.email}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">{order.contactInfo?.phone}</span>
                            <button 
                              style={copyButtonStyle}
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(order.contactInfo?.phone, 'Phone number');
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>

                    {order.orderType === 'Delivery' && order.deliveryAddress && (
                      <div className="mb-3">
                        <h6 className="mb-2">Delivery Address</h6>
                        <Card className="bg-light">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <p className="mb-1">{order.deliveryAddress.street}</p>
                                <p className="mb-0">
                                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
                                </p>
                              </div>
                              <button
                                style={copyButtonStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(
                                    `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zip}`,
                                    'Address'
                                  );
                                }}
                              >
                                Copy
                              </button>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-danger flex-grow-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, 'CANCELLED');
                        }}
                      >
                        Cancel Order
                      </button>
                      <button
                        className="btn btn-success flex-grow-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, 'COMPLETED');
                        }}
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="col-md-6">
                    <h6 className="mb-2">Order Items</h6>
                    <ListGroup variant="flush">
                      {order.items.map((item, index) => (
                        <ListGroup.Item key={index} className="bg-light border-0 mb-2">
                          <div className="d-flex gap-3">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                style={imageStyle}
                              />
                            )}
                            <div className="flex-grow-1">
                              <div className="fw-medium">{item.name}</div>
                              <div className="text-muted small">
                                {item.salePrice ? (
                                  <>
                                    <span className="text-decoration-line-through me-2">
                                      ${item.price?.toFixed(2)}
                                    </span>
                                    <span className="text-danger">
                                      ${item.salePrice?.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span>${item.price?.toFixed(2)}</span>
                                )}
                                {' x '}{item.quantity}
                              </div>
                              {item.category && (
                                <div className="text-muted small">{item.category}</div>
                              )}
                            </div>
                            <div className="fw-medium">
                              ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    <Card className="bg-light mt-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Subtotal</span>
                          <span>
                            ${order.items.reduce((sum, item) => 
                              sum + ((item.salePrice || item.price) * item.quantity), 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total</span>
                          <span>${order.total?.toFixed(2)}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default RecentOrders;