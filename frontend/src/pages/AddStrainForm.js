import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';

const AddStrainForm = () => {
  const [strain, setStrain] = useState({
    name: '',
    classification: 'Hybrid',
    description: '',
    genetics: [],
    effects: [],
    terpenes: [],
    aroma: []
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const classifications = ['Sativa', 'Indica', 'Hybrid', 'CBD'];
  const commonEffects = [
    'Relaxed', 'Uplifted', 'Happy', 'Euphoric', 'Creative',
    'Energized', 'Focused', 'Sleepy', 'Social'
  ];

  const styles = {
    mainContainer: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fafafa',
      padding: '40px 20px'
    },
    card: {
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      borderRadius: '12px',
      border: '1px solid #eaeaea',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      backgroundColor: '#ffffff'
    },
    cardBody: {
      padding: '2.5rem'
    },
    title: {
      color: '#2d3748',
      fontSize: '1.75rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    formLabel: {
      color: '#4a5568',
      fontWeight: '600',
      fontSize: '0.95rem',
      marginBottom: '0.5rem'
    },
    formControl: {
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      backgroundColor: '#ffffff'
    },
    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.95rem',
      color: '#4a5568'
    },
    submitButton: {
      padding: '0.75rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      borderRadius: '8px',
      backgroundColor: '#22c55e',
      border: 'none',
      transition: 'background-color 0.2s ease',
      width: '100%'
    }
  };

  const handleArrayField = (field, value) => {
    setStrain(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleStringArrayInput = (field, value) => {
    const arrayValues = value.split(',').map(item => item.trim()).filter(Boolean);
    setStrain(prev => ({
      ...prev,
      [field]: arrayValues
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('https://api.weedhurry.com/api/strains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strain),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to add strain');
      }

      setMessage(data.message || 'Strain added successfully!');
      setStrain({
        name: '',
        classification: 'Hybrid',
        description: '',
        genetics: [],
        effects: [],
        terpenes: [],
        aroma: []
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.mainContainer}>
      <Container>
        <Card style={styles.card}>
          <Card.Body style={styles.cardBody}>
            <h2 style={styles.title}>Add New Strain</h2>

            {message && (
              <Alert variant="success" className="mb-4">
                {message}
              </Alert>
            )}

            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Strain Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={strain.name}
                  onChange={(e) => setStrain(prev => ({ ...prev, name: e.target.value }))}
                  style={styles.formControl}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Classification *</Form.Label>
                <Form.Select
                  value={strain.classification}
                  onChange={(e) => setStrain(prev => ({ ...prev, classification: e.target.value }))}
                  style={styles.formControl}
                  required
                >
                  {classifications.map(classification => (
                    <option key={classification} value={classification}>
                      {classification}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={strain.description}
                  onChange={(e) => setStrain(prev => ({ ...prev, description: e.target.value }))}
                  style={styles.formControl}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Genetics (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={strain.genetics.join(', ')}
                  onChange={(e) => handleStringArrayInput('genetics', e.target.value)}
                  style={styles.formControl}
                  placeholder="Parent 1, Parent 2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Effects</Form.Label>
                <div style={styles.checkboxGrid}>
                  {commonEffects.map(effect => (
                    <Form.Check
                      key={effect}
                      type="checkbox"
                      id={`effect-${effect}`}
                      label={effect}
                      checked={strain.effects.includes(effect)}
                      onChange={() => handleArrayField('effects', effect)}
                      style={styles.checkboxLabel}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Terpenes (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={strain.terpenes.join(', ')}
                  onChange={(e) => handleStringArrayInput('terpenes', e.target.value)}
                  style={styles.formControl}
                  placeholder="Myrcene, Limonene, Pinene"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Aroma (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={strain.aroma.join(', ')}
                  onChange={(e) => handleStringArrayInput('aroma', e.target.value)}
                  style={styles.formControl}
                  placeholder="Earthy, Sweet, Citrus"
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                style={styles.submitButton}
                className="hover:bg-green-700"
              >
                Add Strain
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AddStrainForm;