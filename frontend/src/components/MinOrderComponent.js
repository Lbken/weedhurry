import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const MinOrderComponent = ({ minOrder, acceptedPayments = [], onUpdate }) => {
  const [formData, setFormData] = useState({
    minOrder: minOrder,
    acceptedPayments: acceptedPayments,
  });

  useEffect(() => {
    if (minOrder !== undefined && acceptedPayments?.length >= 0) {
      setFormData({
        minOrder: minOrder,
        acceptedPayments: acceptedPayments,
      });
    }
  }, [minOrder, acceptedPayments]);

  const handlePaymentFeeChange = (index, value) => {
    setFormData((prev) => {
      const updatedPayments = [...prev.acceptedPayments];
      updatedPayments[index].fee = parseFloat(value) || 0;
      return { ...prev, acceptedPayments: updatedPayments };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.minOrder < 0) {
      alert('Minimum order cannot be less than 0');
      return;
    }
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm">
      <div className="d-flex flex-column">
        {/* Minimum Order Input */}
        <div className="d-flex align-items-center mb-3">
          <label htmlFor="minOrder" className="form-label me-2 mb-0">
            Minimum Order:
          </label>
          <div className="input-group" style={{ maxWidth: '150px' }}>
            <span className="input-group-text">$</span>
            <input
              type="number"
              id="minOrder"
              className="form-control text-end"
              value={formData.minOrder}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                minOrder: e.target.value.slice(0, 3)
              }))}
              min="0"
              max="999"
              style={{ paddingRight: '10px' }}
            />
          </div>
        </div>

        {/* Accepted Payments Section */}
        <Form.Group className="mb-3">
          <Form.Label>Accepted Payments</Form.Label>
          <div>
            {["Cash", "Debit", "Credit"].map((method, index) => (
              <div key={method} className="d-flex align-items-center mb-2">
                <Form.Check
                  type="checkbox"
                  id={method}
                  label={method}
                  checked={formData.acceptedPayments.some(
                    (payment) => payment && payment.method === method
                  )}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const updatedPayments = prev.acceptedPayments.filter(
                        (payment) => payment && payment.method !== method
                      );

                      if (e.target.checked) {
                        updatedPayments.push({ method, fee: 0 });
                      }

                      return { ...prev, acceptedPayments: updatedPayments };
                    })
                  }
                />
                {(method === "Debit" || method === "Credit") &&
                  formData.acceptedPayments.some(
                    (payment) => payment && payment.method === method
                  ) && (
                    <InputGroup className="ms-3" style={{ maxWidth: "150px" }}>
                      <InputGroup.Text>Fee:</InputGroup.Text>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        maxLength="2"
                        placeholder="0"
                        value={
                          formData.acceptedPayments.find(
                            (payment) => payment && payment.method === method
                          )?.fee || ""
                        }
                        onChange={(e) =>
                          handlePaymentFeeChange(index, e.target.value.slice(0, 2))
                        }
                      />
                    </InputGroup>
                  )}
              </div>
            ))}
          </div>
        </Form.Group>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary">
          Update Settings
        </button>
      </div>
    </form>
  );
};

export default MinOrderComponent;