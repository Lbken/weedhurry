import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import ProductDetails from './ProductDetails';

const ProductRow = ({ product, vendorName, logoUrl, vendorId, orderType }) => {
  const { addToCart } = useContext(CartContext);
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsOpen = () => setShowDetails(true);
  const handleDetailsClose = () => setShowDetails(false);

  // Safeguard values
  const price = product.price ?? 0;
  const salePrice = product.salePrice ?? null;
  const strain = product.strain;
  const image = product.image || '/placeholder-image.png';
  const amount = product.amount || 'N/A';
  
  // Get tag to display - prioritize 'Staff Pick' if present
  const displayTag = product.tags?.includes('Staff Pick') 
    ? 'Staff Pick' 
    : product.tags?.[0];

  return (
    <>
      <div className="row align-items-center border-bottom py-3">
        {/* Product Image */}
        <div className="col-4 position-relative" onClick={handleDetailsOpen} style={{ cursor: 'pointer' }}>
          {/* Sale Badge */}
          {salePrice && (
            <span
              className="badge rounded-pill text-white position-absolute"
              style={{
                backgroundColor: '#FF0080',
                fontSize: '0.7rem',
                padding: '0.3rem 0.6rem',
                top: '5px',
                left: '5px',
                zIndex: 1,
              }}
            >
              SALE
            </span>
          )}
          
          {/* Tag Badge - Now positioned at bottom left */}
          {displayTag && (
            <span
              className="badge rounded-pill text-white position-absolute"
              style={{
                backgroundColor: displayTag === 'Staff Pick' ? '#4CAF50' : '#2196F3',
                fontSize: '0.7rem',
                padding: '0.3rem 0.6rem',
                bottom: '5px',
                left: '5px',
                zIndex: 1,
              }}
            >
              {displayTag}
            </span>
          )}

          <img
            src={image}
            alt={product.name || 'Product Image'}
            className="img-fluid rounded"
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Product Info */}
        <div className="col-6 d-flex flex-column">
          {/* Brand and Amount Row */}
          <div className="d-flex align-items-center">
            {/* Product Brand */}
            <p
              className="mb-1"
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '0',
                cursor: 'pointer',
              }}
              onClick={handleDetailsOpen}
            >
              {product.brand || 'No Brand'}
            </p>

            {/* Amount Badge */}
            <span
              className="badge bg-outline-secondary ms-5"
              style={{
                fontSize: '0.8rem',
                padding: '0.25rem 0.5rem',
                color: '#434343',
                backgroundColor: '#EFEFEF',
                position: 'relative',
                top: '-2.5px',
              }}
            >
              {amount}
            </span>
          </div>

          {/* Product Name */}
          <p
            className="text-dark mb-1"
            style={{
              fontSize: '1rem',
              fontWeight: 'normal',
              fontFamily: 'Arial, sans-serif',
              cursor: 'pointer',
            }}
            onClick={handleDetailsOpen}
          >
            {product.name}
          </p>

          {/* Product Strain */}
          <p
            className="text-muted mb-2"
            style={{
              fontSize: '0.9rem',
              fontWeight: 'normal',
              fontFamily: 'Arial, sans-serif',
              cursor: 'pointer',
            }}
            onClick={handleDetailsOpen}
          >
            {strain || 'No Strain'}
          </p>

          {/* Price Section */}
          <div className="d-flex align-items-center">
            {/* Sale Price or Regular Price */}
            {salePrice ? (
              <>
                <span
                  className="badge bg-light text-danger fw-bold"
                  style={{
                    fontSize: '1.1rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  ${salePrice.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    textDecoration: 'line-through',
                    color: '#888',
                    marginLeft: '0.5rem',
                  }}
                >
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span
                className="badge bg-light text-dark fw-bold"
                style={{
                  fontSize: '1.1rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                }}
              >
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="col-2 text-end">
          <button
            className="btn btn-primary rounded-circle"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                ...product,
                price: price,
                salePrice: salePrice,
                vendorName,
                logoUrl,
                primaryImage: image,
                strain: strain,
                vendorId,
                productId: product._id,
                orderType,
              });
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        show={showDetails}
        handleClose={handleDetailsClose}
        product={product}
        vendorName={vendorName}
        logoUrl={logoUrl}
        vendorId={vendorId}
      />
    </>
  );
};

export default ProductRow;