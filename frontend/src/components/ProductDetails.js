import React, { useState, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';

const ProductDetails = ({ show, handleClose, product, vendorName, logoUrl, vendorId }) => {
  const { addToCart, cartItems } = useContext(CartContext);
  const [localQuantity] = useState(1);

  if (!product) return null;

  // Safeguard values
  const {
    name = 'N/A',
    brand = 'N/A',
    description = '',
    category = 'Uncategorized',
    strain = 'N/A',
    thcContent = null,
    price = 0,
    salePrice = null,
    image = '/placeholder-image.png',
    amount = 'N/A',
    tags = [],
  } = product;

  const cartItem = cartItems.find((item) => item._id === product._id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: localQuantity,
      price: salePrice || price,
      vendorName,
      logoUrl,
      primaryImage: image,
      vendorId,
    });
  };

  const modalStyle = {
    content: {
      borderRadius: '16px',
      padding: '0',
    },
    header: {
      border: 'none',
      padding: '1.5rem 1.5rem 0.75rem',
    },
    headerTitle: {
      fontSize: '1.1rem',
      color: '#1a1a1a',
      fontFamily: 'Arial, sans-serif'
    },
    body: {
      padding: '0.75rem 1.5rem',
    },
    footer: {
      border: 'none',
      padding: '0.75rem 1.5rem 1.5rem',
      backgroundColor: 'transparent',
    },
    closeButton: {
      backgroundColor: '#f8f9fa',
      border: 'none',
      borderRadius: '50%',
      padding: '0.5rem',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
      style={{ zIndex: 1601 }}
      contentClassName="border-0"
    >
      <Modal.Header closeButton style={modalStyle.header}>
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center gap-2">
            <span style={{ 
              backgroundColor: '#f8f9fa',
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.875rem',
              color: '#6c757d'
            }}>
              {category}
            </span>
            {currentQuantity > 0 && (
              <span style={{
                backgroundColor: '#e9ecef',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.875rem',
                color: '#495057'
              }}>
                {currentQuantity} in cart
              </span>
            )}
          </div>
          <h5 className="mt-2 mb-0" style={{...modalStyle.headerTitle, fontFamily: 'Arial, sans-serif'}}>
            <strong>{brand}</strong>
          </h5>
        </div>
      </Modal.Header>

      <Modal.Body style={modalStyle.body}>
        <div className="row">
          {/* Left Column - Image */}
          <div className="col-md-5">
            <div className="position-relative">
              <img
                src={image}
                alt={name}
                className="img-fluid rounded-3"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                }}
              />
              {amount && (
                <span
                  className="position-absolute top-0 end-0 m-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  {amount}
                </span>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="col-md-7 mt-3 mt-md-0">
            {/* Tags Section */}
            {tags && tags.length > 0 && (
              <div className="d-flex gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="badge"
                    style={{
                      backgroundColor: tag === 'Staff Pick' ? '#4CAF50' : 
                                     tag === 'High THC' ? '#2196F3' : 
                                     tag === 'Low THC' ? '#FFA726' : '#757575',
                      color: 'white',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h4 className="mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{name}</h4>
            
            <div className="d-flex align-items-center gap-3 mb-3">
              <span style={{ 
                fontSize: '0.9rem',
                color: '#6c757d',
                fontWeight: '500',
                fontFamily: 'Arial, sans-serif'
              }}>
                {strain}
              </span>
              {thcContent && (
                <span style={{
                  backgroundColor: '#f8f9fa',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  color: '#495057',
                }}>
                  {thcContent}% THC
                </span>
              )}
            </div>

            <p className="text-muted" style={{ 
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              fontFamily: 'Arial, sans-serif'
            }}>
              {description}
            </p>

            <div className="d-flex justify-content-between align-items-center mt-auto">
              <div className="d-flex align-items-center gap-2">
                {salePrice ? (
                  <>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#FF0080',
                    }}>
                      ${salePrice.toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      color: '#adb5bd',
                      textDecoration: 'line-through',
                    }}>
                      ${price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#212529',
                  }}>
                    ${price.toFixed(2)}
                  </span>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                style={{
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProductDetails;