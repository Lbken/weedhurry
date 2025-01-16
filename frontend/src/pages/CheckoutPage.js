import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PlaceOrder from '../components/PlaceOrder';
import RegistrationNavBar from '../components/RegistrationNavBar'; // Import the RegistrationNavBar
import Footer from '../components/Footer';

const CheckoutPage = () => {
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  const handleSaveAddress = (address) => {
    setDeliveryAddress(address);
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}> {/* Set background to snow white */}
      <RegistrationNavBar />
      <Container className="mt-5">
        <div className='ms-3'>
          <h2>Checkout</h2>
          <p>All payment is collected upon delivery, please have your VALID ID ready to show.</p>
        </div>
        <Row>
          <Col md={12}>
            <PlaceOrder />
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
