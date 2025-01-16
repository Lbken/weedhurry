import React from 'react';

const Footer = () => {
  return (
    <div className="text-center" style={{ marginTop: '2rem', padding: '1rem 0' }}>
      <img
        src={require('../assets/images/addressPageLogoFaint.png')}
        alt="WeedHurry Logo"
        style={{ height: '40px', marginBottom: '10px' }}
      />
      <div>
        <small className="text-muted">
        <a
            href="/vendor-dashboard"
            style={{ textDecoration: 'none', color: 'grey', fontSize: '0.8rem' }}
          >
            Vendors
          </a>
          {' | '}
          <a
            href="/contact"
            style={{ textDecoration: 'none', color: 'grey', fontSize: '0.8rem' }}
          >
            Contact
          </a>
          {' | '}
          <a
            href="/terms"
            style={{ textDecoration: 'none', color: 'grey', fontSize: '0.8rem' }}
          >
            Terms and Conditions
          </a>
          {' | '}
          <a
            href="/privacy"
            style={{ textDecoration: 'none', color: 'grey', fontSize: '0.8rem' }}
          >
            Privacy Policy
          </a>
        </small>
      </div>
    </div>
  );
};

export default Footer;
