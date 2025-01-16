import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import DeliveryBy from './DeliveryBy';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    incrementItem,
    decrementItem,
    calculateTotal,
    getItemCount,
  } = useContext(CartContext);
  const [isCartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle the cart visibility
  const toggleCart = () => setCartOpen(!isCartOpen);

  // Close the cart when clicking outside
  const closeCartOnOutsideClick = () => {
    if (isCartOpen) setCartOpen(false);
  };

  const isRestrictedPage = location.pathname === '/' || location.pathname === '/checkout' || location.pathname === '/vendor-dashboard';

  // Return nothing if the current page is restricted
  if (isRestrictedPage) return null;

  return (
    <>
      {/* Overlay to close cart on outside click */}
      {isCartOpen && (
        <div
          onClick={closeCartOnOutsideClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1600,
          }}
        ></div>
      )}

      {/* Conditionally Render Cart Icon */}
      {!isRestrictedPage && getItemCount() > 0 && (
        <button
          className="btn position-fixed"
          style={{
            bottom: '20px',
            right: isCartOpen ? '320px' : '20px',
            width: '60px',
            height: '60px',
            border: '2px solid #343a40',
            backgroundColor: '#343a40',
            color: 'white',
            borderRadius: '50%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1600,
            transition: 'right 0.3s ease-in-out',
          }}
          onClick={toggleCart}
        >
          <i className="bi bi-basket-fill" style={{ fontSize: '1.5rem' }}></i>
          <span
            className="badge bg-danger position-absolute"
            style={{
              top: '5px',
              right: '5px',
              fontSize: '0.8rem',
            }}
          >
            {getItemCount()}
          </span>
        </button>
      )}

      {/* Slide-In Cart Drawer */}
      <div
        className={`offcanvas offcanvas-end ${isCartOpen ? 'show' : ''}`}
        style={{
          width: '300px',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1600,
        }}
      >
        <div className="offcanvas-header bg-dark text-white">
          <h5 className="offcanvas-title">Your Cart</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={toggleCart}
          ></button>
        </div>
        <div className="offcanvas-body p-3">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="d-flex align-items-center mb-3 border-bottom pb-3"
              >
                <img
                  src={item.primaryImage || '/placeholder-image.png'}
                  alt={item.name}
                  className="rounded"
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    marginRight: '10px',
                  }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1 text-truncate">{item.name}</h6>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    {item.strain || 'N/A'}
                  </p>
                  <div className="d-flex align-items-center mt-1">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => decrementItem(item._id)}
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => incrementItem(item._id)}
                    >
                      +
                    </button>
                  </div>
                  {/* Display Sale Price with Original Price Crossed Out */}
                  <p className="mt-2 mb-0">
                    {item.salePrice ? (
                      <>
                        <span
                          className="text-danger fw-bold"
                          style={{ fontSize: '0.9rem' }}
                        >
                          ${item.salePrice.toFixed(2)}
                        </span>
                        <span
                          className="text-muted text-decoration-line-through ms-2"
                          style={{ fontSize: '0.85rem' }}
                        >
                          ${item.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeFromCart(item._id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">Your cart is empty.</p>
          )}
          <div>
            {/* Delivery By Component */}
            {cartItems.length > 0 && (
              <DeliveryBy
                logoUrl={cartItems[0].logoUrl}
                dispensaryName={cartItems[0].vendorName}
                vendorId={cartItems[0].vendorId}
                orderType={cartItems[0].orderType}
                onClose={toggleCart}
              />
            )}
          </div>
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="offcanvas-footer bg-light border-top p-3">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total: </span>
              <span className="fw-bold">${calculateTotal().toFixed(2)}</span>
            </div>
            <p className="text-muted text-end" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                All taxes included
            </p>
            <button
              className="btn btn-primary w-100"
              onClick={() => {
                toggleCart();
                navigate('/checkout'); // Navigate to checkout page
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
