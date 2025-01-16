import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const { order, cartItemsSummary } = location.state || {};

  if (!order || !cartItemsSummary) {
    return <div className="container mt-5">Order details not available.</div>;
  }

  const renderThankYouMessage = () => (
    <Card className="shadow-sm mb-4">
      <Card.Body className="text-center">
        <h4 className="mb-3">Thank You For Your Order!</h4>
        <p className="mb-1">Your order has been received and the vendor has been notified.</p>
        {order.orderType === 'Pickup' ? (
          <p className="text-success">
            You will receive a text message when your order is ready for pickup. 
            Pickup orders are typically ready within 10 minutes.
          </p>
        ) : (
          <p className="text-success">
            You will receive a text message shortly with your estimated delivery time.
          </p>
        )}
      </Card.Body>
    </Card>
  );

  const renderAddressSection = () => {
    if (order.orderType === 'Pickup' && order.vendorDetails?.storefrontAddress) {
      return (
        <div className="mb-4">
          <h5>Pickup Address</h5>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              {order.vendorDetails.logoUrl && (
                <img 
                  src={order.vendorDetails.logoUrl} 
                  alt={order.vendorDetails.dispensaryName}
                  className="me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                />
              )}
              <div>
                <h5 className="mb-1">{order.vendorDetails.dispensaryName}</h5>
                <p className="text-secondary mb-0">
                  {order.vendorDetails.storefrontAddress.formatted}
                </p>
                <p className="text-primary mt-2">
                  <i className="bi bi-info-circle me-2"></i>
                  Please have your ID ready for pickup
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      );
    }

    if (order.deliveryAddress) {
      return (
        <div className="mb-4">
          <h5>Delivery Address</h5>
          <p className="mb-0">{order.deliveryAddress.street}</p>
          <p className="mb-0">
            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mt-5">
      {renderThankYouMessage()}
      
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">Order Confirmation</h3>
        </Card.Header>
        <Card.Body>
          {/* Order Details */}
          <div className="mb-4">
            <h5>Order Details</h5>
            <p className="mb-0"><strong>Order ID:</strong> {order._id}</p>
            <p className="mb-0"><strong>Order Type:</strong> {order.orderType}</p>
            <p className="mb-0"><strong>Status:</strong> {order.status}</p>
            <p className="mb-0"><strong>Total Amount:</strong> ${order.total.toFixed(2)}</p>
            <p className="mb-0"><strong>Payment Method:</strong> {order.payment_method}</p>
          </div>

          {/* Contact Information */}
          <div className="mb-4">
            <h5>Contact Information</h5>
            <p className="mb-0">
              {order.contactInfo.firstName} {order.contactInfo.lastName}
            </p>
            <p className="mb-0">{order.contactInfo.email}</p>
            <p className="mb-0">{order.contactInfo.phone}</p>
          </div>

          {/* Render Address Section */}
          {renderAddressSection()}

          {/* Items Table */}
          <div>
            <h5>Order Summary</h5>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItemsSummary.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.salePrice ? (
                        <div>
                          <span className="text-danger">${item.salePrice.toFixed(2)}</span>
                          <br />
                          <span className="text-muted text-decoration-line-through">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span>${item.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td>
                      ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                  <td><strong>${order.total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </Table>
          </div>

          {/* Continue Shopping Button */}
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => window.location.href = '/nearby'}
          >
            Continue Shopping
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrderConfirmationPage;