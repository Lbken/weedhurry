import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, X } from 'lucide-react';
import CreateProductModal from './CreateProductModal';
import api from '../api/api';

const AddProductPage = () => {
  const { auth } = useAuth();
  
  // Core state
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Variations state
  const [variations, setVariations] = useState([]);
  const [invalidSalePrices, setInvalidSalePrices] = useState([]);
  
  // Strain autocomplete state
  const [availableStrains, setAvailableStrains] = useState([]);
  const [filteredStrains, setFilteredStrains] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Fetch products when brand or category changes
  useEffect(() => {
    if (brand) {
      setSearchAttempted(true);
      api.get(`/api/products/filters`, {
        params: {
          brand: brand,
          category: category
        }
      })
        .then((response) => {
          const validProducts = response.data.filter(product => product && product._id);
          const uniqueProducts = Array.from(
            new Map(validProducts.map(product => [product._id, product])).values()
          );
          setProducts(uniqueProducts);
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
          setProducts([]);
        });
    } else {
      setProducts([]);
      setSearchAttempted(false);
    }
  }, [brand, category]);

  // Fetch available strains
  useEffect(() => {
    const fetchStrains = async () => {
      try {
        const response = await api.get('/api/strains');  
setAvailableStrains(response.data);
setFilteredStrains(response.data);
      } catch (error) {
        console.error('Error fetching strains:', error);
        setAvailableStrains([]);
        setFilteredStrains([]);
      }
    };
  
    fetchStrains();
  }, []);

  // Handlers for product selection and variation management
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setBrand(product.brand);
    setVariations([{
      amount: '',
      strain: '',
      price: '',
      salePrice: '',
      thcContent: '',
      image: product.images?.[0] || '',
      tags: [], // Initialize empty tags array
    }]);
  };

  const handleAddVariation = () => {
    setVariations(prev => [
      ...prev,
      {
        amount: '',
        strain: '',
        price: '',
        salePrice: '',
        thcContent: '',
        image: selectedProduct?.images?.[0] || '',
        tags: [], // Initialize empty tags array
      }
    ]);
  };

  const handleRemoveVariation = (index) => {
    setVariations(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariationChange = (index, key, value) => {
    setVariations(prev => prev.map((v, i) => 
      i === index ? { ...v, [key]: value } : v
    ));

    if (key === 'strain' && value.trim()) {
      setFilteredStrains(
        availableStrains.filter(strain =>
          strain.name.toLowerCase().includes(value.toLowerCase())
        )
      );
      setActiveDropdownIndex(index);
      setDropdownVisible(true);
    }
  };

  const handleTagToggle = (index, tag) => {
    setVariations(prev => prev.map((v, i) => {
      if (i === index) {
        const currentTags = v.tags || [];
        const newTags = currentTags.includes(tag)
          ? currentTags.filter(t => t !== tag)
          : [...currentTags, tag];
        return { ...v, tags: newTags };
      }
      return v;
    }));
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

  const handleImageSelect = (index, image) => {
    handleVariationChange(index, 'image', image);
  };

  const handleAddToInventory = async () => {
    setInvalidSalePrices([]);
    
    if (!selectedProduct || variations.some(v => 
      !v.amount || !v.strain || !v.price || !v.image
    )) {
      alert('Please fill out all required fields for each variation.');
      return;
    }
  
    const invalidIndices = variations.reduce((acc, variation, index) => {
      if (variation.salePrice && parseFloat(variation.salePrice) >= parseFloat(variation.price)) {
        acc.push(index);
      }
      return acc;
    }, []);
  
    if (invalidIndices.length > 0) {
      setInvalidSalePrices(invalidIndices);
      alert('Sale price must be less than regular price.');
      return;
    }
  
    try {
      await Promise.all(variations.map(variation =>
        api.post('/api/vendor/inventory', {
          vendorId: auth.vendorId,
          productId: selectedProduct._id,
          name: selectedProduct.name,
          category: selectedProduct.category,
          brand: selectedProduct.brand,
          description: selectedProduct.description,
          amounts: selectedProduct.amount,
          variation: {
            amount: variation.amount,
            strain: variation.strain,
            thcContent: variation.thcContent ? parseFloat(variation.thcContent) : undefined,
            price: parseFloat(variation.price),
            salePrice: variation.salePrice ? parseFloat(variation.salePrice) : undefined,
            image: variation.image,
            tags: variation.tags || [],
          }
        })
      ));
  
      alert('Products added successfully!');
      resetForm();
      
      const event = new CustomEvent('inventoryUpdated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error adding products:', error);
      alert('An error occurred while adding the products.');
    }
  };

  const resetForm = () => {
    setBrand('');
    setCategory('');
    setSelectedProduct(null);
    setVariations([]);
    setInvalidSalePrices([]);
    setSearchAttempted(false);
  };
  

  const handleCreateProduct = async (formData) => {
    try {
      const productFormData = new FormData();
      
      productFormData.append('name', formData.name);
      productFormData.append('brand', formData.brand);
      productFormData.append('category', formData.category);
      productFormData.append('description', formData.description);
      productFormData.append('amount', JSON.stringify(formData.variations.map(v => v.amount)));
      
      formData.variations.forEach((variation, index) => {
        if (variation.image) {
          productFormData.append('images', variation.image, `product-${index}-${Date.now()}.jpg`);
        }
      });
  
      const response = await api.post('/api/products', productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      // Access response.data directly instead of calling .json()
      const productData = response.data;
  
      await Promise.all(formData.variations.map(async (variation, index) => {
        const vendorProductData = {
          vendorId: auth.vendorId,
          productId: productData._id,
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          description: formData.description,
          amounts: formData.variations.map(v => v.amount),
          variation: {
            amount: variation.amount,
            strain: variation.strain,
            thcContent: variation.thcContent ? parseFloat(variation.thcContent) : undefined,
            price: parseFloat(variation.price),
            salePrice: variation.salePrice ? parseFloat(variation.salePrice) : undefined,
            image: productData.images[index],
            tags: variation.tags || [],
          },
          status: 'Active'
        };
  
        const vendorProductResponse = await api.post('/api/vendor/inventory', vendorProductData);
  
        if (!vendorProductResponse.data) {
          throw new Error(`Failed to create vendor product variation ${index + 1}`);
        }
      }));
  
      alert('Products added to inventory successfully!');
      setIsCreateModalOpen(false);
      resetForm();
      
      const event = new CustomEvent('inventoryUpdated');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error creating products:', error);
      alert(`An error occurred while creating the products: ${error.message}`);
    }
  };
  
  return (
    <div className="container mt-4">
      <h3>Add Product to Menu</h3>
      
      {/* Category Selection */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Category</label>
        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Flower">Flower</option>
          <option value="Pre-roll">Pre-roll</option>
          <option value="Vape">Vape</option>
          <option value="Edible">Edible</option>
          <option value="Extract">Concentrate</option>
          <option value="Tincture">Tincture</option>
          <option value="Gear">Gear</option>
        </select>
      </div>

      {/* Brand Input - Only shown when category is selected */}
      {category && (
        <div className="mb-3">
          <label className="form-label fw-semibold">Brand</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter brand name"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
      )}

      {/* Products Section */}
      {searchAttempted && (
        <div className="mb-3">
          <label className="form-label fw-semibold">Products from Master Catalog</label>
          <div className="list-group mb-3">
            {products.length > 0 ? (
              products.map((product) => (
                <li
                  key={product._id}
                  className={`list-group-item ${selectedProduct?._id === product._id ? 'active' : ''}`}
                  onClick={() => handleProductSelect(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <strong>{product.brand}</strong> - {product.name}
                      <br />
                      <small className="text-muted">
                        Available amounts: {product.amount?.join(', ')}
                      </small>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="list-group-item text-center text-muted">
                No matching products found
              </div>
            )}
            
            <button
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-center text-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Product
            </button>
          </div>
        </div>
      )}

      {/* Variations Section */}
      {selectedProduct && (
        <>
          <h3>Variations</h3>
          {variations.map((variation, index) => (
            <div
              key={index}
              className="mb-8 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium">Variation #{index + 1}</h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Image Selection */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Image</label>
                <div className="d-flex overflow-auto" style={{ maxWidth: '100%', gap: '10px' }}>
                  {selectedProduct.images.map((image, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={image}
                      alt={`Product Image ${imgIndex + 1}`}
                      onClick={() => handleImageSelect(index, image)}
                      className={`img-thumbnail ${variation.image === image ? 'border-primary' : ''}`}
                      style={{
                        cursor: 'pointer',
                        width: '250px',
                        height: '250px',
                        objectFit: 'cover',
                        borderWidth: variation.image === image ? '3px' : '1px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              {category !== 'Gear' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Amount</label>
                  <select
                    className="form-select"
                    value={variation.amount}
                    onChange={(e) => handleVariationChange(index,'amount', e.target.value)}
                    >
                      <option value="" disabled>Select Amount</option>
                      {selectedProduct?.amount?.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                )}
  
                {/* Strain Input */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">Strain</label>
                  <input
                    type="text"
                    className="form-control"
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
                    }, 100)}
                  />
                  {index === activeDropdownIndex && dropdownVisible && filteredStrains.length > 0 && (
                    <ul className="dropdown-menu show position-absolute" style={{ zIndex: 10 }}>
                      {filteredStrains.map((strain, i) => (
                        <li
                          key={i}
                          className="dropdown-item"
                          onMouseDown={() => handleSelectStrain(index, strain)}
                        >
                          {strain.name} ({strain.classification.substring(0, 3).toUpperCase()})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
  
                {/* Price Fields */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Price ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={variation.price}
                      onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Sale Price ($)</label>
                    <input
                      type="number"
                      className={`form-control ${invalidSalePrices.includes(index) ? 'is-invalid' : ''}`}
                      placeholder='Optional'
                      value={variation.salePrice}
                      onChange={(e) => handleVariationChange(index, 'salePrice', e.target.value)}
                    />
                    {invalidSalePrices.includes(index) && (
                      <div className="invalid-feedback">
                        Sale price must be less than regular price
                      </div>
                    )}
                  </div>
                </div>
  
                {/* THC Content */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">THC Content (%)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder='Optional'
                    value={variation.thcContent}
                    onChange={(e) => handleVariationChange(
                      index,
                      'thcContent',
                      e.target.value.replace(/[^0-9.]/g, '')
                    )}
                  />
                </div>
  
                {/* Tags */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tags</label>
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={variation.tags?.includes('Staff Pick') || false}
                        onChange={() => handleTagToggle(index, 'Staff Pick')}
                      />
                      <label className="form-check-label">Staff Pick</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={variation.tags?.includes('High THC') || false}
                        onChange={() => handleTagToggle(index, 'High THC')}
                      />
                      <label className="form-check-label">High THC</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={variation.tags?.includes('Low THC') || false}
                        onChange={() => handleTagToggle(index, 'Low THC')}
                      />
                      <label className="form-check-label">Low THC</label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
  
            {/* Add Variation & Submit Buttons */}
            <div className="d-flex flex-column align-items-start gap-4">
              <button 
                className="btn btn-secondary shadow-sm" 
                onClick={handleAddVariation}
                style={{
                  width: '150px',
                  height: '150px',
                  backgroundColor: '#DBDBDB',
                  color: '#333333',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Variation
              </button>
  
              <button 
                className="btn btn-primary rounded-pill shadow-sm w-100 mb-5" 
                onClick={handleAddToInventory}
                style={{
                  backgroundColor: '#0056b3',
                  padding: '15px 30px',
                  fontSize: '1.2rem',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Add to Menu
              </button>
            </div>
          </>
        )}
  
        {/* Create Product Modal */}
        <CreateProductModal
          show={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProduct}
        />
  
        {/* Bottom Spacing */}
        <div style={{height: '300px'}}></div>
      </div>
    );
  };
  
  export default AddProductPage;