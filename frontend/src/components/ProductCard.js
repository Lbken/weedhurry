import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import ProductDetails from './ProductDetails';

const ProductCard = ({ product, vendorName, logoUrl, vendorId, orderType }) => {
  const { addToCart } = useContext(CartContext);
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsOpen = () => setShowDetails(true);
  const handleDetailsClose = () => setShowDetails(false);

  // Safeguard values
  const price = product.price ?? 0;
  const salePrice = product.salePrice ?? null;
  const strain = product.strain;
  const image = product.image || '/placeholder-image.png';
  const amount = product.amount;
  const tags = product.tags || [];
  const isStaffPick = tags.includes('Staff Pick');
  const otherTag = !isStaffPick ? tags.find(tag => ['High THC', 'Low THC'].includes(tag)) : null;

  return (
    <>
      <div
        className="card product-card shadow-sm"
        style={{
          width: '14rem',
          position: 'relative',
          cursor: 'default',
          paddingTop: '0',
        }}
      >
        {/* SALE Banner */}
        {salePrice && (
          <div
            className="position-absolute top-0 start-50 translate-middle-x text-center"
            style={{
              backgroundColor: '#FF0080',
              color: 'white',
              fontSize: '0.8rem',
              padding: '0.5rem .8rem',
              fontWeight: 'bold',
              zIndex: 1,
              borderBottomLeftRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem',
            }}
          >
            SALE
          </div>
        )}

        {/* Product Image and Badges Container */}
        <div style={{ position: 'relative' }}>
          {/* Staff Pick or Other Tag Badge */}
          {(isStaffPick || otherTag) && (
            <div
              className="position-absolute start-0 top-0 m-2"
              style={{
                zIndex: 2,
                backgroundColor: isStaffPick ? '#4CAF50' : '#FFA726',
                color: 'white',
                fontSize: '0.65rem',
                padding: '0.3em 0.6em',
                fontWeight: '500',
                borderRadius: '18px',
              }}
            >
              {isStaffPick ? 'Staff Pick' : otherTag}
            </div>
          )}
          
          <img
            src={image}
            alt={product.name || 'Product Image'}
            className="img-fluid my-1 mt-5"
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              cursor: 'pointer',
              borderTopLeftRadius: '0.25rem',
              borderTopRightRadius: '0.25rem',
            }}
            onClick={handleDetailsOpen}
          />
          
          {/* Amount Badge */}
          <span
            className="position-absolute top-0 end-0 badge bg-light text-dark"
            style={{
              fontSize: '0.8rem',
              padding: '0.25rem 0.5rem',
              margin: '0.5rem',
              borderRadius: '0.25rem',
            }}
          >
            {amount || 'N/A'}
          </span>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column justify-content-between mt-0">
          {/* Product Brand */}
          <div className="text-center">
            <p
              style={{ 
                fontSize: '0.9rem', 
                marginBottom: '0.2rem', 
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {product.brand || 'No Brand'}
            </p>
          </div>

          {/* Product Name and Strain */}
          <div className="text-start">
            <p
              className="text-dark text-center mb-1"
              style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'normal', 
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif'
              }}
              onClick={handleDetailsOpen}
            >
              {product.name}
            </p>
            <p
              className="text-muted text-center mb-1"
              style={{ 
                fontSize: '.9rem', 
                fontWeight: 'normal', 
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif'
              }}
              onClick={handleDetailsOpen}
            >
              {strain}
            </p>
          </div>

          {/* Footer Section */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            {/* Price Section */}
            <div
              className="d-flex align-items-center justify-content-center mt-2"
              style={{ gap: '0.5rem' }}
            >
              {salePrice ? (
                <>
                  <span
                    className="badge bg-light"
                    style={{
                      fontSize: '1.1rem',
                      padding: '0.5rem 1rem',
                      fontWeight: 'bold',
                      color: '#FF0080',
                      borderRadius: '0.5rem',
                    }}
                  >
                    ${salePrice.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      textDecoration: 'line-through',
                      color: '#888',
                      fontWeight: 'normal',
                    }}
                  >
                    ${price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span
                  className="badge bg-light text-dark"
                  style={{
                    fontSize: '1.1rem',
                    padding: '0.5rem 1rem',
                    fontWeight: 'bold',
                    borderRadius: '0.5rem',
                  }}
                >
                  ${price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
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

export default ProductCard;