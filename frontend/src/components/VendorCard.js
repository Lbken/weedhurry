import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';

const VendorCard = ({ vendor, orderType }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [statusText, setStatusText] = useState('');
  const PRODUCT_LIMIT = 30;

  const formatTime = (time) => {
    // Convert 24-hour time string (HH:MM) to 12-hour format with AM/PM
    const [hours] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12} ${ampm}`;
  };

  const calculateVendorStatus = useCallback(() => {
    if (!vendor.businessHours) return { isOpen: false, text: 'Closed' };

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    });

    const todayHours = vendor.businessHours[currentDay];
    if (!todayHours?.open || !todayHours?.close) {
      return { isOpen: false, text: 'Closed' };
    }

    const isCurrentlyOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
    
    if (isCurrentlyOpen) {
      return { 
        isOpen: true, 
        text: `Open until ${formatTime(todayHours.close)}` 
      };
    } else if (currentTime < todayHours.open) {
      return { 
        isOpen: false, 
        text: `Opens at ${formatTime(todayHours.open)}` 
      };
    } else {
      return { 
        isOpen: false, 
        text: 'Closed' 
      };
    }
  }, [vendor.businessHours]);

  useEffect(() => {
    const status = calculateVendorStatus();
    setIsOpen(status.isOpen);
    setStatusText(status.text);

    // Update status every minute
    const intervalId = setInterval(() => {
      const newStatus = calculateVendorStatus();
      setIsOpen(newStatus.isOpen);
      setStatusText(newStatus.text);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [calculateVendorStatus]);

  const handleViewMenu = () => {
    navigate(`/vendor/${vendor._id}/menu`);
  };

  return (
    <div
      className="vendor-card p-3 mb-0"
      style={{ border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#FFF' }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-start">
          <img
            src={vendor.logoUrl || '/placeholder-logo.png'}
            alt={vendor.dispensaryName}
            className="rounded"
            onClick={handleViewMenu}
            style={{
              width: '44px',
              height: '44px',
              objectFit: 'cover',
              marginRight: '10px',
              cursor: 'pointer',
            }}
          />

          <div className="d-flex flex-column justify-content-start" style={{ minHeight: '44px' }}>
            <h6 className="mb-1" onClick={handleViewMenu} style={{ fontSize: '1rem', fontWeight: 'semi-bold' }}>
              {vendor.dispensaryName}
            </h6>
            <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
              {vendor.minOrder && vendor.minOrder > 0 ? `$${vendor.minOrder}` : 'No'} minimum | {vendor.milesAway || 'N/A'} miles away
            </p>
            <div 
              className="px-2 py-1 rounded-pill d-flex align-items-center"
              style={{
                backgroundColor: isOpen ? '#ebf7ee' : '#ffebee',
                color: isOpen ? '#2e7d32' : '#d32f2f',
                fontSize: '0.75rem',
                fontWeight: '500',
                alignSelf: 'flex-start',
                height: '20px'
              }}
            >
              <span className="me-1" style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: isOpen ? '#2e7d32' : '#d32f2f',
                display: 'inline-block'
              }}></span>
              {statusText}
            </div>
          </div>
        </div>

        <button
          className="btn rounded-pill"
          onClick={handleViewMenu}
          style={{
            backgroundColor: '#005FEB',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#024DBC')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#005FEB')}
        >
          Menu
        </button>
      </div>

      <div className="products-preview mt-3">
        {vendor.products && vendor.products.length ? (
          <div className="d-flex overflow-auto" style={{ paddingBottom: '10px', scrollbarWidth: 'thin' }}>
            {vendor.products.slice(0, PRODUCT_LIMIT).map((product) => (
              <div
                key={`${product._id}-${product.strain}-${product.amount}`}
                className="me-2"
                style={{ minWidth: '200px', flex: '0 0 auto' }}
              >
                <ProductCard
                  product={product}
                  vendorName={vendor.dispensaryName}
                  logoUrl={vendor.logoUrl}
                  vendorId={vendor._id}
                  orderType={orderType}
                />
              </div>
            ))}
            {vendor.products.length > PRODUCT_LIMIT && (
              <div 
                className="d-flex align-items-center justify-content-center me-2"
                style={{ 
                  minWidth: '200px', 
                  flex: '0 0 auto',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <button
                  onClick={handleViewMenu}
                  className="btn text-primary"
                  style={{
                    padding: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  View Full Menu
                  <br />
                  ({vendor.products.length - PRODUCT_LIMIT} more items)
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted">No matching products available</p>
        )}
      </div>
    </div>
  );
};

export default VendorCard;