import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col, Form, Card, Container } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { loadGoogleMapsScript } from '../utils/googleMapsLoader';
import api from '../api/api';

const PlaceOrder = () => {
  const {
    calculateTotal,
    cartItems,
    clearCart,
    incrementItem,
    decrementItem,
    removeFromCart,
  } = useContext(CartContext);
  
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
  });

  const [savedAddress, setSavedAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPaymentFee, setSelectedPaymentFee] = useState(0);
  const [vendorPaymentMethods, setVendorPaymentMethods] = useState([]);
  const [vendorDetails, setVendorDetails] = useState(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();
  const subtotal = calculateTotal();
  const estimatedTotal = subtotal + selectedPaymentFee;

  useEffect(() => {
    let autocompleteInstance = null;
  
    const initializeAutocomplete = async () => {
      try {
        if (isEditing && inputRef.current) {
          await loadGoogleMapsScript();
          
          // Make sure the element still exists after script loads
          if (inputRef.current) {
            autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
              types: ['geocode']
            });
  
            autocompleteInstance.addListener('place_changed', () => {
              const place = autocompleteInstance.getPlace();
              if (place?.formatted_address) {
                setNewAddress(place.formatted_address);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };
  
    initializeAutocomplete();
  
    // Cleanup
    return () => {
      if (autocompleteInstance) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [isEditing]);

  // Load saved data and fetch vendor details
  useEffect(() => {
    const address = localStorage.getItem('userAddress');
    if (address) setSavedAddress(address);

    const storedContactInfo = JSON.parse(localStorage.getItem('contactInfo'));
    if (storedContactInfo) setContactInfo(storedContactInfo);

    const fetchVendorData = async () => {
      const cartItem = cartItems[0];
      if (!cartItem) {
        console.warn('No items in cart');
        return;
      }
      // Get vendorId, handling different possible formats
      const vendorId = cartItem.vendorId?.toString() || cartItem._id?.toString();
      console.log('Attempting to fetch vendor with ID:', vendorId, 'Cart Item:', cartItem);
      if (vendorId) {
        try {
          const response = await api.get(`/api/vendors/${vendorId}`);
          if (response.data?.success) {
            const vendorData = response.data.data;
            console.log('Vendor data received:', vendorData);
            setVendorDetails(vendorData);
            if (Array.isArray(vendorData.acceptedPayments)) {
              console.log('Setting payment methods:', vendorData.acceptedPayments);
              setVendorPaymentMethods(vendorData.acceptedPayments);
            } else {
              console.warn('No accepted payments found in vendor data');
              setVendorPaymentMethods([]);
            }
          } else {
            console.error('Vendor data response was not successful:', response.data);
          }
        } catch (error) {
          console.error('Error fetching vendor data:', {
            error,
            cartItem,
            vendorId,
          });
        }
      }
    };
  
    fetchVendorData();
  }, [cartItems]);

  // Setup Google Places Autocomplete
  useEffect(() => {
    if (isEditing && inputRef.current && window.google?.maps?.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) {
          setNewAddress(place.formatted_address);
        }
      });
    }
  }, [isEditing]);

  // Save contact info to localStorage
  useEffect(() => {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
  }, [contactInfo]);

  const formatBirthdate = (value) => {
    const digits = value.replace(/\D/g, '');
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 4),
      digits.slice(4, 8),
    ].filter(Boolean);
    return parts.join('/');
  };

  const handleBirthdateChange = (e) => {
    const formattedValue = formatBirthdate(e.target.value);
    setContactInfo({ ...contactInfo, birthdate: formattedValue });
  };

  const handleSaveAddress = () => {
    localStorage.setItem('userAddress', newAddress);
    setSavedAddress(newAddress);
    setIsEditing(false);
  };

  const handlePaymentMethodSelect = (method, fee) => {
    setPaymentMethod(method);
    setSelectedPaymentFee(fee);
  };

  const handlePlaceOrder = async () => {
    // Validation for required fields
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phone || !contactInfo.birthdate) {
      alert('Please fill out all required fields.');
      return;
    }

    const isPickup = cartItems[0]?.orderType === 'Pickup';
    
    if (!isPickup && !localStorage.getItem('userAddress')) {
      alert('Please add a delivery address.');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    let parsedAddress = {};
    if (!isPickup) {
      const userAddress = localStorage.getItem('userAddress');
      const addressParts = userAddress.split(',').map((part) => part.trim());
      const street = addressParts[0] || '';
      const city = addressParts[1] || '';
      const stateZip = addressParts[2]?.split(' ') || [];
      const state = stateZip[0] || '';
      const zip = stateZip[1] || '';

      parsedAddress = { street, city, state, zip };

      if (!parsedAddress.street || !parsedAddress.city || !parsedAddress.state || !parsedAddress.zip) {
        alert('Invalid delivery address format. Please re-enter your address.');
        return;
      }
    }

    const payload = {
      phone: contactInfo.phone,
      firstName: contactInfo.firstName,
      lastName: contactInfo.lastName,
      email: contactInfo.email,
      birthday: contactInfo.birthdate,
      totalAmount: estimatedTotal,
      vendorId: cartItems[0]?.vendorId,
      orderDetails: {
        order_status: 'AWAITING_PROCESSING',
        delivery_address: isPickup ? null : parsedAddress,
        items: cartItems.map((item) => ({
          productId: item.productId || item._id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
          salePrice: item.salePrice || null,
          image: item.image,
          brand: item.brand || item.variation?.brand,
          strain: item.variation?.strain || item.strain || null,
        })),
        payment_method: paymentMethod,
        payment_fee: selectedPaymentFee,
        orderType: isPickup ? 'Pickup' : 'Delivery',
        vendorDetails: {
          dispensaryName: vendorDetails?.dispensaryName,
          storefrontAddress: vendorDetails?.storefrontAddress,
          logoUrl: vendorDetails?.logoUrl
        }
      },
    };

    try {
      const response = await api.post('/api/customer/create-order', payload);
      
      // Axios automatically throws on non-2xx responses, so if we get here, it succeeded
      navigate(`/order-confirmation/${response.data.orderId}`, {
        state: {
          order: response.data.order,
          cartItemsSummary: response.data.order.items,
        },
      });
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        alert(`Failed to place order: ${error.response.data.message || 'Please try again'}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert('Could not reach the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        alert('An error occurred. Please try again later.');
      }
    }
  };

  const renderLocationSection = () => {
    const isPickup = cartItems[0]?.orderType === 'Pickup';

    if (isPickup && vendorDetails) {
      return (
        <div className="mb-4">
          <h4>Pickup Location</h4>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <img 
                src={vendorDetails.logoUrl} 
                alt={vendorDetails.dispensaryName}
                className="me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div>
                <h5 className="mb-1">{vendorDetails.dispensaryName}</h5>
                <p className="text-secondary mb-0">
                  {vendorDetails.storefrontAddress?.formatted || 'Address not available'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4>Delivery Address</h4>
        {isEditing ? (
          <Form>
            <Form.Group controlId="address" className="mb-3">
              <Form.Control
                type="text"
                ref={inputRef}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter your address"
                required
              />
            </Form.Group>
            <Button variant="success" onClick={handleSaveAddress}>
              Save Address
            </Button>
          </Form>
        ) : (
          <div>
            <Card.Text className="text-secondary mb-2">
              {savedAddress || 'No address saved'}
            </Card.Text>
            <Button
              variant="primary"
              onClick={() => {
                setNewAddress(savedAddress);
                setIsEditing(true);
              }}
            >
              {savedAddress ? 'Edit Address' : 'Add Address'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Container fluid className="place-order-section py-4">
        <Row className="g-4">
          <Col lg={6} xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                {renderLocationSection()}

                <hr />

                <h4 className="mb-3">Contact Information</h4>
                <Form>
                  <Row className="mb-3">
                    <Col>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={contactInfo.firstName}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, firstName: e.target.value })
                        }
                        required
                      />
                    </Col>
                    <Col>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={contactInfo.lastName}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, lastName: e.target.value })
                        }
                        required
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, email: e.target.value })
                        }
                        required
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        value={contactInfo.phone}
                        placeholder=""
                        onChange={(e) => {
                          const input = e.target.value.replace(/\D/g, '');
                          let formattedInput = input;

                          if (input.length > 3 && input.length <= 6) {
                            formattedInput = `(${input.slice(0, 3)}) ${input.slice(3)}`;
                          } else if (input.length > 6) {
                            formattedInput = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
                          }

                          setContactInfo({ ...contactInfo, phone: formattedInput });
                        }}
                        maxLength={14}
                        required
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Label>Birthdate</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="MM/DD/YYYY"
                        value={contactInfo.birthdate}
                        onChange={handleBirthdateChange}
                        required
                      />
                    </Col>
                  </Row>
                </Form>

                <h4 className="mb-3">Payment Method</h4>
                <div className="d-flex flex-wrap gap-2">
                  {vendorPaymentMethods.map((method, index) => (
                    <Button
                      key={index}
                      variant={paymentMethod === method.method ? 'primary' : 'outline-primary'}
                      onClick={() => handlePaymentMethodSelect(method.method, method.fee)}
                    >
                      {method.fee > 0
                        ? `${method.method} ($${method.fee.toFixed(2)} Fee)`
                        : method.method}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h4>Order Summary</h4>
                {cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item) => (
                      <div
                        key={item.productId}
                        className="d-flex align-items-center mb-3"
                        style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                        />

                        <div className="flex-grow-1">
                          <strong>{item.name}</strong>
                          <div>
                            {item.salePrice ? (
                              <div>
                                <span className="text-danger me-2">
                                  ${item.salePrice.toFixed(2)}
                                </span>
                                <span className="text-muted text-decoration-line-through">
                                  ${item.price.toFixed(2)}
                                </span>
                                <div className="text-success small">
                                  ${Math.abs(item.price - item.salePrice).toFixed(2)} Savings!
                                </div>
                              </div>
                            ) : (
                              <span>${item.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            style={{ width: '30px', height: '30px', fontSize: '1rem' }}
                            onClick={() => decrementItem(item.productId)}
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            style={{ width: '30px', height: '30px', fontSize: '1rem' }}
                            onClick={() => incrementItem(item.productId)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="btn btn-outline-danger btn-sm ms-2"
                          style={{ width: '30px', height: '30px', fontSize: '1rem', border: '0' }}
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ))}

                    {/* Price Summary Section */}
                    <div className="mt-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      
                      {selectedPaymentFee > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <span>Payment Fee</span>
                          <span>${selectedPaymentFee.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                        <span>
                          <strong>Total</strong>{' '}
                          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                            (Taxes Included)
                          </span>
                        </span>
                        <span><strong>${estimatedTotal.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button 
                      variant="primary" 
                      className="w-100 mt-4" 
                      onClick={handlePlaceOrder}
                      disabled={cartItems.length === 0}
                    >
                      Place Order
                    </Button>

                    {/* Order Type Message */}
                    <p className="text-secondary text-center mt-3" style={{ fontSize: '0.9rem' }}>
                      {cartItems[0]?.orderType === 'Pickup' ? (
                        <>Please note, you will receive a text message when your order is ready for pickup.</>
                      ) : (
                        <>Please note, you will receive a text message from {vendorDetails?.dispensaryName || 'the vendor'} with delivery ETA shortly after placing order.</>
                      )}
                    </p>
                  </>
                ) : (
                  <p>Your cart is empty.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PlaceOrder;