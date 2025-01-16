import React from 'react';
import ContactForm from '../components/ContactForm';  // Updated import path
import Footer from '../components/Footer';

const ContactPage = () => {
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '3rem 1rem'
  };

  const headerStyle = {
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 3rem',
    padding: '0 1rem'
  };

  const contactInfoStyle = {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '1rem',
    textAlign: 'center'
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 className="mb-3" style={{ color: '#333', fontSize: '2.5rem' }}>Get in Touch</h1>
        <p className="lead text-muted">
          Have questions or want to learn more? We'd love to hear from you. 
          Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <ContactForm />
      <Footer />
    </div>
  );
};

export default ContactPage;