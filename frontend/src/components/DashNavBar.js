import React, { useState } from 'react';
import { Navbar, Container, Image, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import VendorLogoCard from './VendorLogoCard';
import VendorInfoCard from './VendorInfoCard';
import DispensaryInfoCard from './DispensaryInfoCard';
import LogoutButton from './LogoutButton';

const DashNavBar = ({ vendorData }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setShowSidebar(false);
  };

  const handleLogoClick = () => {
    if (vendorData?._id) {
      navigate(`/vendor/${vendorData._id}/menu`);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('(888) 301-5480');
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

  // Style objects
  const navbarStyle = {
    backgroundColor: '#1a1a1a',
    height: '60px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const logoStyle = {
    height: '35px',
    width: 'auto',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  };

  const vendorLogoStyle = {
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    objectFit: 'cover',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.2s',
  };

  const dispensaryNameStyle = {
    color: 'white',
    marginRight: '1rem',
    fontSize: '1rem',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  };

  const rightContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const sidebarStyle = {
    position: 'fixed',
    right: showSidebar ? '0' : '-350px',
    top: '0',
    width: '350px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.2)',
    transition: 'right 0.3s ease-in-out',
    zIndex: 1040,
    overflowY: 'auto',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1039,
    display: showSidebar ? 'block' : 'none',
    backdropFilter: 'blur(2px)',
  };

  const notificationBoxStyle = {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    border: '1px solid #e9ecef',
  };

  const phoneNumberStyle = {
    fontWeight: '600',
    color: '#2c3e50',
    display: 'inline-block',
    marginRight: '0.5rem',
  };

  const copyButtonStyle = {
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '0.75rem',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    padding: '0',
    display: 'inline-block',
  };

  const customStyles = `
    <style>
      .sidebar-card {
        width: 100% !important;
        margin: 0 0 1rem 0 !important;
        border-radius: 12px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
      }
      
      .sidebar-card .card-body {
        padding: 1rem !important;
      }
      
      .sidebar-card img {
        width: 100px !important;
        height: 100px !important;
        object-fit: cover !important;
      }

      .copy-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2000;
      }
    </style>
  `;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {showCopyAlert && (
        <Alert 
          variant="success" 
          className="copy-alert"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            borderRadius: '8px',
          }}
        >
          Phone number copied to clipboard!
        </Alert>
      )}
      
      <Navbar style={navbarStyle} variant="dark" fixed="top">
        <Container fluid>
          <Navbar.Brand>
            <Image
              src={require('../assets/images/miniLogo.jpg')}
              alt="Mini Logo"
              style={logoStyle}
              onClick={handleLogoClick}
              className="hover:scale-105"
            />
          </Navbar.Brand>
          <div style={rightContainerStyle}>
            <span style={dispensaryNameStyle}>
              {vendorData?.firstName || 'Loading...'}
            </span>
            <Image
              src={vendorData?.logoUrl || ''}
              alt="Vendor Logo"
              style={vendorLogoStyle}
              onClick={() => setShowSidebar(true)}
              className="hover:scale-105"
            />
          </div>
        </Container>
      </Navbar>

      <div style={overlayStyle} onClick={handleClose} />

      <div style={sidebarStyle}>
        {showSidebar && (
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold">Profile Settings</h5>
              <button
                className="btn btn-link text-dark"
                onClick={handleClose}
                style={{ fontSize: '1.5rem', textDecoration: 'none' }}
              >
                ×
              </button>
            </div>

            <div style={notificationBoxStyle}>
              <div className="mb-2" style={{ fontWeight: '500' }}>SMS Notifications Info:</div>
              <Image 
                src={require('../assets/images/textNotice.jpg')}
                alt="SMS Notification Example"
                fluid
                className="mb-3"
                style={{ borderRadius: '8px' }}
              />
              Order SMS notifications will be sent from 
              <span style={phoneNumberStyle}>(888) 301-5480</span>
              <button 
                onClick={handleCopyNumber} 
                style={copyButtonStyle}
              >
                Copy
              </button>
              <div className="mt-2" style={{ color: '#6c757d' }}>
                Weedhurry DOES NOT provide customer with any delivery updates or notifications after order is placed. Be sure to respond promptly to customers with delivery ETA by using 'Orders' tab once notification is received.
              </div>
            </div>

            <div className="sidebar-content">
              <VendorInfoCard className="sidebar-card" />
              <VendorLogoCard className="sidebar-card" />
              <DispensaryInfoCard className="sidebar-card" />        
              <div className="d-flex justify-content-center mt-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashNavBar;