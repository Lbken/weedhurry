import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    from_name: '',
    to_name: '',
    message: '',
    reply_to: ''
  });
  const [isSending, setIsSending] = useState(false);

  const formStyle = {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff'
  };

  const labelStyle = {
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#212529'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      emailjs.init('hW_eDezKFNuokT_2c');

      await emailjs.sendForm(
        'default_service',
        'template_jdinw0g',
        e.target
      );

      // Reset form
      setFormData({
        from_name: '',
        to_name: '',
        message: '',
        reply_to: ''
      });
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message. Please try again.');
      console.error('EmailJS Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={formStyle}>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="from_name" className="form-label" style={labelStyle}>
            Your Name
          </label>
          <input
            type="text"
            className="form-control"
            id="from_name"
            name="from_name"
            value={formData.from_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="reply_to" className="form-label" style={labelStyle}>
            Your Email
          </label>
          <input
            type="email"
            className="form-control"
            id="reply_to"
            name="reply_to"
            value={formData.reply_to}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="message" className="form-label" style={labelStyle}>
            Message
          </label>
          <textarea
            className="form-control"
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            style={{ minHeight: '120px', resize: 'vertical' }}
            required
          />
        </div>


        <button
          type="submit"
          className={`btn btn-primary w-100 ${isSending ? 'disabled' : ''}`}
          disabled={isSending}
          style={{
            backgroundColor: '#2d3748',
            border: 'none',
            padding: '0.75rem',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}
        >
          {isSending ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;