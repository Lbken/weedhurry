import React, { useState, useContext } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Image, Dropdown } from 'react-bootstrap';
import { Tag, Phone, MessageCircle, Clock } from 'lucide-react';
import { VendorContext } from '../context/VendorContext';
import MenuPickupDeliveryToggle from './MenuPickupDeliveryToggle';
import './VendorDetails.css';

const VendorDetails = ({ 
  vendor = {}, 
  orderType, 
  setOrderType 
}) => {
  const { vendorStatus } = useContext(VendorContext);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const {
    logoUrl = '/placeholder-logo.png',
    dispensaryName = '',
    minOrder = 0,
    acceptedPayments = [],
    dailyPromo = null,
    businessHours = {},
    contactNumber: { formatted: contactNumber = '' } = {},
  } = vendor || {};

  const formatTime = (time) => {
    if (!time) return 'Closed';
    
    if (!time.includes(':')) {
      const hour = parseInt(time, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12} ${ampm}`;
    }

    const [hour, minute] = time.split(':').map(Number);
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => {
    const isOpen = vendorStatus?.status === 'open';
    
    if (!vendorStatus) return null;

    return (
      <div
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
        className="px-2 py-1 rounded-pill d-flex align-items-center"
        style={{
          backgroundColor: isOpen ? '#ebf7ee' : '#ffebee',
          color: isOpen ? '#2e7d32' : '#d32f2f',
          fontSize: '0.75rem',
          fontWeight: '500',
          cursor: 'pointer',
          height: '24px'
        }}
      >
        <span 
          className="me-1" 
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isOpen ? '#2e7d32' : '#d32f2f',
            display: 'inline-block'
          }}
        />
        <span>
          {isOpen
            ? `Open until ${formatTime(vendorStatus.until)}`
            : `Opens at ${formatTime(vendorStatus.until)}`}
        </span>
        {children}
      </div>
    );
  });

  if (!vendor) return null;

  const currentDay = vendorStatus?.currentDay || '';

  return (
    <Card className="border-0 vendor-details">
      <Card.Body className="p-3">
        {/* Header Section */}
        <Row className="align-items-center mb-3 gx-3">
          <Col xs={7} sm="auto" className="mb-2 mb-sm-0">
            <div className="d-flex align-items-center">
              <Image
                src={logoUrl}
                alt={`${dispensaryName || 'Vendor'} logo`}
                className="rounded-circle vendor-logo me-3"
                style={{ width: '48px', height: '48px', objectFit: 'cover', flexShrink: 0 }}
                onError={(e) => {
                  e.target.src = '/placeholder-logo.png';
                }}
              />
              <div className="flex-grow-1 min-width-0">
                <h6 className="fw-semibold mb-1 text-truncate">{dispensaryName}</h6>
                {vendorStatus && businessHours && Object.keys(businessHours).length > 0 && (
                  <Dropdown className="position-relative" style={{ position: 'relative', zIndex: 1050 }}>
                    <Dropdown.Toggle as={CustomToggle} id="vendor-status-dropdown" />
                    <Dropdown.Menu 
                      align="start" 
                      className="shadow-sm border-0 p-3"
                      style={{ minWidth: '280px' }}
                    >
                      {contactNumber && (
                        <div className="d-flex justify-content-around mb-3">
                          <a
                            href={`tel:${contactNumber}`}
                            className="text-decoration-none text-gray-700 d-flex align-items-center gap-2"
                          >
                            <Phone size={16} />
                            <span style={{ fontSize: '0.875rem' }}>Call</span>
                          </a>
                          <a
                            href={`sms:${contactNumber}`}
                            className="text-decoration-none text-gray-700 d-flex align-items-center gap-2"
                          >
                            <MessageCircle size={16} />
                            <span style={{ fontSize: '0.875rem' }}>Text</span>
                          </a>
                        </div>
                      )}

                      {minOrder > 0 && (
                        <>
                          <div className="d-flex align-items-center justify-content-center mb-3">
                            <span className="text-gray-600" style={{ fontSize: '0.875rem' }}>
                              ${minOrder} minimum order
                            </span>
                          </div>
                          <hr className="my-3" />
                        </>
                      )}

                      <div className="mb-3 d-flex align-items-center gap-2">
                        <Clock size={16} className="text-gray-600" />
                        <span className="fw-medium" style={{ fontSize: '0.875rem' }}>
                          Business Hours
                        </span>
                      </div>

                      <div className="space-y-1">
                        {Object.entries(businessHours).map(([day, hours]) => (
                          <div 
                            key={day} 
                            className={`d-flex justify-content-between align-items-center ${
                              day === currentDay ? 'fw-medium' : ''
                            }`}
                            style={{ 
                              fontSize: '0.875rem',
                              backgroundColor: day === currentDay ? '#f8f9fa' : 'transparent',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px'
                            }}
                          >
                            <span className={day === currentDay ? 'text-dark' : 'text-gray-600'}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </span>
                            <span className={day === currentDay ? 'text-dark' : 'text-gray-800'}>
                              {formatTime(hours.open)} - {formatTime(hours.close)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </Col>
          
          <Col xs={5} sm="auto" className="ms-auto text-end">
            {setOrderType && (
              <MenuPickupDeliveryToggle
                vendor={vendor}
                orderType={orderType}
                setOrderType={setOrderType}
                className="w-100"
              />
            )}
          </Col>
        </Row>

        {/* Footer Section */}
        <Row className="align-items-center gx-3">
          <Col xs={12} sm className="mb-2 mb-sm-0">
            {acceptedPayments.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {acceptedPayments.map((payment, index) => (
                  <Badge
                    key={index}
                    bg="white"
                    text="dark"
                    className="border"
                    style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'normal',
                      padding: '0.35rem 0.75rem'
                    }}
                  >
                    {payment.method}
                  </Badge>
                ))}
              </div>
            )}
          </Col>
          <Col s={12} sm={12} md={12} lg={4}>
            {dailyPromo?.title && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowPromoModal(true)}
                className="d-flex align-items-center gap-2 rounded-pill w-100 justify-content-center mt-2"
                style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
              >
                <Tag size={14} />
                <span className="text-truncate" style={{ maxWidth: '250px' }}>
                  {dailyPromo.title}
                </span>
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>

      {/* Promo Modal */}
      {dailyPromo && (
        <Modal
          show={showPromoModal}
          onHide={() => setShowPromoModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="fs-5">
              {dailyPromo.title}
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body className="p-4">
            <p className="text-secondary mb-4">
              {dailyPromo.description || 'No description provided.'}
            </p>
            
            {dailyPromo.promoUrl && (
              <div className="text-center">
                <img
                  src={dailyPromo.promoUrl}
                  alt="Promo"
                  className="img-fluid rounded mb-2"
                  style={{ maxWidth: '90%' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <p className="text-secondary small mt-2">
                  Present coupon in-person during payment to apply.
                </p>
              </div>
            )}

            {dailyPromo.applicableToSaleItems !== undefined && (
              <p className={`fw-medium ${
                dailyPromo.applicableToSaleItems 
                  ? 'text-success' 
                  : 'text-danger'
              } mb-0 mt-3`}>
                {dailyPromo.applicableToSaleItems
                  ? 'Applicable to Sale Items!'
                  : 'Not applicable to sale items.'}
              </p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPromoModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Card>
  );
};

export default VendorDetails;