import React, { useState, useEffect } from 'react';
import { Modal, Form, Alert, Button, Row, Col } from 'react-bootstrap';
import { X, Plus, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const CreateProductModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    category: 'Flower',
    description: '',
    variations: [
      {
        amount: '',
        strain: '',
        thcContent: '',
        price: '',
        salePrice: '',
        image: null
      }
    ]
  });
  
  const [errors, setErrors] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [availableStrains, setAvailableStrains] = useState([]);
  const [filteredStrains, setFilteredStrains] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);

  const initialFormState = {
    brand: '',
    name: '',
    category: 'Flower',
    description: '',
    variations: [
      {
        amount: '',
        strain: '',
        thcContent: '',
        price: '',
        salePrice: '',
        image: null
      }
    ]
  };

  // Fetch available strains
  useEffect(() => {
    const fetchStrains = async () => {
      try {
        const response = await fetch('https://api.weedhurry.com/api/strains', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // Assuming the API returns an array of strains directly
        // If it's nested in a data property, use data.data instead
        setAvailableStrains(data);
        setFilteredStrains(data);
      } catch (error) {
        console.error('Error fetching strains:', error);
        // Set empty arrays to prevent map errors
        setAvailableStrains([]);
        setFilteredStrains([]);
      }
    };
  
    fetchStrains();
  }, []);

  const categories = [
    'Flower',
    'Pre-roll',
    'Vape',
    'Edible',
    'Concentrate',
    'Tincture',
    'Gear'
  ];

  const categoryAmounts = {
    Flower: ['3.5g', '7g', '½oz', '1oz'],
    Vape: ['0.3g', '0.5g', '1g'],
    'Pre-roll': ['1g', '1.2g', '2.5g', '3g', '3.5g', '4g', '5g', '7g'],
    Edible: ['5mg', '20mg', '25mg', '50mg', '100mg', '150mg', '200mg', '300mg', '500mg', '1000mg'],
    Concentrate: ['0.5g', '1g'],
    Tincture: ['500mg', '1000mg'],
    Gear: []
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
  
      if (name === 'category') {
        newData.variations = prev.variations.map(variation => ({
          ...variation,
          amount: ''
        }));
      }
  
      return newData;
    });
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVariationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
    
    if (errors[`variation-${index}-${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`variation-${index}-${field}`]: ''
      }));
    }

    if (field === 'strain' && value.trim()) {
      const filtered = availableStrains.filter(strain =>
        strain.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStrains(filtered);
      setActiveDropdownIndex(index);
      setDropdownVisible(true);
    }
  };

  const handleSelectStrain = (index, strain) => {
    handleVariationChange(
      index,
      'strain',
      `${strain.name} (${strain.classification.substring(0, 3).toUpperCase()})`
    );
    setDropdownVisible(false);
    setActiveDropdownIndex(null);
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please choose an image under 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files.');
        return;
      }
      const url = URL.createObjectURL(file);
      setImageUrls(prev => {
        const newUrls = [...prev];
        newUrls[index] = url;
        return newUrls;
      });
      handleVariationChange(index, 'image', file);
    }
  };

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, {
        amount: '',
        strain: '',
        thcContent: '',
        price: '',
        salePrice: '',
        image: null
      }]
    }));
  };

  const removeVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const reuseImage = (targetIndex, sourceIndex) => {
    const sourceImage = formData.variations[sourceIndex].image;
    const sourceUrl = imageUrls[sourceIndex];
    
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) => 
        i === targetIndex ? { ...v, image: sourceImage } : v
      )
    }));
    
    setImageUrls(prev => {
      const newUrls = [...prev];
      newUrls[targetIndex] = sourceUrl;
      return newUrls;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    formData.variations.forEach((variation, index) => {
      if (!variation.amount && formData.category !== 'Gear') {
        newErrors[`variation-${index}-amount`] = 'Amount is required';
      }
      if (!variation.strain && formData.category !== 'Gear') {
        newErrors[`variation-${index}-strain`] = 'Strain is required';
      }
      if (!variation.price || variation.price <= 0) {
        newErrors[`variation-${index}-price`] = 'Valid price is required';
      }
      if (variation.salePrice && Number(variation.salePrice) >= Number(variation.price)) {
        newErrors[`variation-${index}-salePrice`] = 'Sale price must be less than regular price';
      }
      if (!variation.image) {
        newErrors[`variation-${index}-image`] = 'Image is required';
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
        // Step 1: Create the base product in catalog
        const productData = new FormData();
        productData.append('name', formData.name);
        productData.append('brand', formData.brand);
        productData.append('category', formData.category);
        productData.append('description', formData.description);
        
        // Get unique amounts for the base product
        const uniqueAmounts = [...new Set(formData.variations.map(v => v.amount))];
        productData.append('amount', JSON.stringify(uniqueAmounts));

        // Add all variation images to the product catalog
        formData.variations.forEach((variation, index) => {
            if (variation.image) {
                productData.append('images', variation.image);
            }
        });

        // Create base product with all images
        const productResponse = await axios.post('/api/products', productData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        });

        // Step 2: Create vendor products for each variation using catalog images
        const creationPromises = formData.variations.map((variation, index) => {
            // Use the corresponding image URL from the product catalog
            const imageUrl = productResponse.data.images[index];

            // Create vendor product
            return axios.post('/api/vendor-products', {
                productId: productResponse.data._id,
                name: formData.name,
                brand: formData.brand,
                category: formData.category,
                description: formData.description,
                amounts: uniqueAmounts,
                variation: {
                    amount: variation.amount,
                    strain: variation.strain,
                    thcContent: variation.thcContent || null,
                    price: parseFloat(variation.price),
                    salePrice: variation.salePrice ? parseFloat(variation.salePrice) : null,
                    image: imageUrl,
                    tags: []
                }
            }, {
                withCredentials: true
            });
        });

        await Promise.all(creationPromises);

        // Reset form state
        setFormData(initialFormState);
        // Reset image URLs
        setImageUrls([]);
        // Reset errors
        setErrors({});
        // Reset dropdown states
        setDropdownVisible(false);
        setActiveDropdownIndex(null);
        // Close modal
        onClose();
    } catch (error) {
        console.error('Error creating products:', error);
        // Show error to user
    }
};

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Add New Product</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="max-h-[80vh] overflow-y-auto">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Brand</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  isInvalid={!!errors.brand}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.brand}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>


            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  placeholder="Provide brief descriprtion of product-- DO NOT include strain-specific info."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="border-top pt-4">
            <h4 className="mb-4">Product Variations</h4>
            {formData.variations.map((variation, index) => (
              <div
                key={index}
                className="mb-4 p-4 rounded"
                style={{ backgroundColor: '#f8f9fa' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Variation #{index + 1}</h5>
                  {index > 0 && (
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => removeVariation(index)}
                    >
                      <X />
                    </Button>
                  )}
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Amount</Form.Label>
                      {formData.category !== 'Gear' ? (
                        <Form.Select
                          value={variation.amount}
                          onChange={(e) => handleVariationChange(index, 'amount', e.target.value)}
                          isInvalid={!!errors[`variation-${index}-amount`]}
                        >
                          <option value="">Select Amount</option>
                          {categoryAmounts[formData.category].map((amount) => (
                            <option key={amount} value={amount}>
                              {amount}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type="text"
                          value={variation.amount}
                          onChange={(e) => handleVariationChange(index, 'amount', e.target.value)}
                          placeholder="N/A"
                          disabled
                        />
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors[`variation-${index}-amount`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Strain / Flavor</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          value={variation.strain}
                          onChange={(e) => handleVariationChange(index, 'strain', e.target.value)}
                          onFocus={() => {
                            if (variation.strain.trim()) {
                              setActiveDropdownIndex(index);
                              setDropdownVisible(true);
                            }
                          }}
                          onBlur={() => setTimeout(() => {
                            setDropdownVisible(false);
                            setActiveDropdownIndex(null);
                          }, 200)}
                          isInvalid={!!errors[`variation-${index}-strain`]}
                        />
                        {index === activeDropdownIndex && dropdownVisible && filteredStrains.length > 0 && (
                          <ul 
                            className="dropdown-menu show position-absolute w-100" 
                            style={{ zIndex: 1000 }}
                          >
                            {filteredStrains.map((strain, i) => (
                              <li
                                key={i}
                                className="dropdown-item"
                                style={{ cursor: 'pointer' }}
                                onMouseDown={() => handleSelectStrain(index, strain)}
                              >
                                {strain.name} ({strain.classification.substring(0, 3).toUpperCase()})
                              </li>
                            ))}
                          </ul>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors[`variation-${index}-strain`]}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                  </Col>


                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={variation.price}
                        onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                        isInvalid={!!errors[`variation-${index}-price`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`variation-${index}-price`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Sale Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        value={variation.salePrice}
                        onChange={(e) => handleVariationChange(index, 'salePrice', e.target.value)}
                        isInvalid={!!errors[`variation-${index}-salePrice`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`variation-${index}-salePrice`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">THC Content (%)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        placeholder="Optional"
                        value={variation.thcContent}
                        onChange={(e) => handleVariationChange(index, 'thcContent', e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Product Image</Form.Label>
                      <div className="d-flex flex-wrap gap-3">
                        {imageUrls[index] ? (
                          <div className="position-relative">
                            <img
                              src={imageUrls[index]}
                              alt={`Variation ${index + 1}`}
                              className="rounded"
                              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1 p-1"
                              onClick={() => {
                                setImageUrls(prev => {
                                  const newUrls = [...prev];
                                  newUrls[index] = null;
                                  return newUrls;
                                });
                                handleVariationChange(index, 'image', null);
                              }}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e)}
                                className="d-none"
                                id={`image-upload-${index}`}
                              />
                              <label
                                htmlFor={`image-upload-${index}`}
                                className="d-flex flex-column align-items-center justify-content-center p-4 border border-2 border-dashed rounded cursor-pointer"
                                style={{ width: '120px', height: '120px', cursor: 'pointer' }}
                              >
                                <ImageIcon className="mb-2" />
                                <span className="small text-muted">Upload Image</span>
                              </label>
                            </div>

                            {/* Previously Used Images */}
                            {index > 0 && imageUrls.some((url, i) => i < index && url) && (
                              <div className="d-flex flex-wrap gap-2">
                                {imageUrls.map((url, prevIndex) => (
                                  prevIndex < index && url && (
                                    <div 
                                      key={prevIndex}
                                      className="position-relative cursor-pointer"
                                      onClick={() => reuseImage(index, prevIndex)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <img
                                        src={url}
                                        alt={`Previous variation ${prevIndex + 1}`}
                                        className="rounded"
                                        style={{
                                          width: '120px',
                                          height: '120px',
                                          objectFit: 'cover',
                                          opacity: 0.7,
                                          transition: 'opacity 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                                      />
                                      <div className="position-absolute top-0 start-0 m-1 px-2 py-1 bg-dark text-white rounded-pill small">
                                        Variation #{prevIndex + 1}
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                          </>
                        )}
                        
                        {errors[`variation-${index}-image`] && (
                          <div className="text-danger small mt-2">
                            {errors[`variation-${index}-image`]}
                          </div>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}

            <Button
              variant="secondary"
              className="w-100 mb-4 d-flex align-items-center justify-content-center"
              onClick={addVariation}
              style={{ height: '100px' }}
            >
              <Plus className="me-2" />
              Add Another Variation
            </Button>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger" className="mt-3">
              Please fix the errors above before submitting.
            </Alert>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Create Product
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateProductModal;