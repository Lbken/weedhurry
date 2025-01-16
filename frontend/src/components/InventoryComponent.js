import React, { useState, useEffect, useCallback } from 'react';
import { Offcanvas, ListGroup, Button, Form, InputGroup, FormControl, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import UpdateProductImage from './UpdateProductImage';



const InventoryComponent = () => {
  const { auth } = useAuth();
  const [inventory, setInventory] = useState({});
  const [filteredInventory, setFilteredInventory] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSlideIn, setShowSlideIn] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({ 
    price: '', 
    salePrice: '', 
    tags: [] 
  });

  const availableTags = ['Staff Pick', 'Low THC', 'High THC'];

  // Currency formatter
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const fetchInventory = useCallback(async () => {
    if (!auth?.vendorId) {
      console.error('Vendor ID is not defined in AuthContext');
      return;
    }

    try {
      const response = await api.get(`/api/vendor/inventory/${auth.vendorId}`);
      const groupedData = response.data.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {});
      setInventory(groupedData);
      setFilteredInventory(groupedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  }, [auth?.vendorId]);

  useEffect(() => {
    fetchInventory();
  
    const handleInventoryUpdate = () => {
      fetchInventory();
    };
  
    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
  
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
  }, [auth, fetchInventory]);

  const handleRefresh = async () => {
    await fetchInventory();
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredInventory(inventory);
      return;
    }

    const newFilteredInventory = {};
    Object.keys(inventory).forEach((category) => {
      const filteredProducts = inventory[category].filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term)
      );
      if (filteredProducts.length) newFilteredInventory[category] = filteredProducts;
    });
    setFilteredInventory(newFilteredInventory);
  };

  const handleRowClick = (product) => {
    setSelectedProduct({
      ...product,
      name: product.name || product.productId?.name,
      description: product.description || product.productId?.description,
      status: product.status || 'Active',
    });
    setUpdatedDetails({
      price: product.variation?.price || '',
      salePrice: product.variation?.salePrice || '',
      tags: product.variation?.tags || []
    });
    setShowSlideIn(true);
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = selectedProduct.status === 'Active' ? 'Disabled' : 'Active';
      await api.patch(`/api/vendor/inventory/${selectedProduct._id}/status`, { 
        status: newStatus 
      });
      
      setInventory((prev) => {
        const updated = { ...prev };
        const category = selectedProduct.category;
        if (updated[category]) {
          updated[category] = updated[category].map((item) =>
            item._id === selectedProduct._id ? { ...item, status: newStatus } : item
          );
        }
        return updated;
      });

      // Also update filtered inventory if search is active
      if (searchTerm) {
        setFilteredInventory((prev) => {
          const updated = { ...prev };
          const category = selectedProduct.category;
          if (updated[category]) {
            updated[category] = updated[category].map((item) =>
              item._id === selectedProduct._id ? { ...item, status: newStatus } : item
            );
          }
          return updated;
        });
      }
      
      setShowSlideIn(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update product status.');
    }
  };

  const handleUpdate = async () => {
    const { price, salePrice } = updatedDetails;
  
    if (salePrice && parseFloat(salePrice) >= parseFloat(price)) {
      alert('Sale price must be less than the regular price.');
      return;
    }
  
    try {
      // Construct the update payload
      const updatedProduct = {
        variation: {
          ...selectedProduct.variation,
          price: parseFloat(updatedDetails.price),
          salePrice: salePrice === '' ? null : salePrice ? parseFloat(salePrice) : null,
          tags: updatedDetails.tags  
        }
      };
  
      // Make API call with the configured api instance
      const response = await api.put(`/api/vendor/inventory/${selectedProduct._id}`, updatedProduct);
  
      if (response.data && response.data.updatedProduct) {
        // Update local state with the returned product data
        setInventory((prevInventory) => {
          const updated = { ...prevInventory };
          const category = selectedProduct.category;
          
          if (updated[category]) {
            updated[category] = updated[category].map((item) =>
              item._id === selectedProduct._id
                ? {
                    ...item,
                    variation: {
                      ...item.variation,
                      price: parseFloat(updatedDetails.price),
                      salePrice: updatedDetails.salePrice ? parseFloat(updatedDetails.salePrice) : null,
                      tags: updatedDetails.tags
                    }
                  }
                : item
            );
          }
          return updated;
        });
  
        // Update filtered inventory if search is active
        if (searchTerm) {
          setFilteredInventory((prevFiltered) => {
            const updated = { ...prevFiltered };
            const category = selectedProduct.category;
            
            if (updated[category]) {
              updated[category] = updated[category].map((item) =>
                item._id === selectedProduct._id
                  ? {
                      ...item,
                      variation: {
                        ...item.variation,
                        price: parseFloat(updatedDetails.price),
                        salePrice: updatedDetails.salePrice ? parseFloat(updatedDetails.salePrice) : null,
                        tags: updatedDetails.tags
                      }
                    }
                  : item
              );
            }
            return updated;
          });
        }
  
        setShowSlideIn(false);
        // Optionally show success message
        alert('Product updated successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating product details:', error);
      alert(
        error.response?.data?.message || 
        'Failed to update product details. Please try again.'
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/vendor/inventory/${selectedProduct._id}`);
      
      setInventory((prev) => {
        const updated = { ...prev };
        const category = selectedProduct.category;
        if (updated[category]) {
          updated[category] = updated[category].filter((item) => item._id !== selectedProduct._id);
        }
        return updated;
      });

      // Also update filtered inventory if search is active
      if (searchTerm) {
        setFilteredInventory((prev) => {
          const updated = { ...prev };
          const category = selectedProduct.category;
          if (updated[category]) {
            updated[category] = updated[category].filter((item) => item._id !== selectedProduct._id);
          }
          return updated;
        });
      }
      
      setShowDeleteModal(false);
      setShowSlideIn(false);
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleTagToggle = (tag) => {
    setUpdatedDetails(prev => {
      const currentTags = [...prev.tags];
      const tagIndex = currentTags.indexOf(tag);
      
      if (tagIndex === -1) {
        currentTags.push(tag);
      } else {
        currentTags.splice(tagIndex, 1);
      }
      
      return {
        ...prev,
        tags: currentTags
      };
    });
  };

  const handleImageUpdate = (newImageUrl) => {
    setInventory((prevInventory) => {
      const updated = { ...prevInventory };
      const category = selectedProduct.category;
      if (updated[category]) {
        updated[category] = updated[category].map((item) =>
          item._id === selectedProduct._id
            ? {
                ...item,
                variation: {
                  ...item.variation,
                  image: newImageUrl
                }
              }
            : item
        );
      }
      return updated;
    });
  };

  const styles = {
    container: {
      backgroundColor: '#fff',
      padding: '20px',
    },
    searchSection: {
      backgroundColor: '#fff',
      padding: '15px 20px',
      marginBottom: '15px',
      borderBottom: '1px solid #dee2e6'
    },
    searchInput: {
      maxWidth: '400px'
    },
    refreshButton: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    },
    categoryHeader: {
      margin: '20px 0 15px 0',
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#333'
    },
    productItem: {
      padding: '15px',
      transition: 'background-color 0.2s',
      cursor: 'pointer',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      borderBottom: '1px solid #dee2e6'
    },
    productImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '4px'
    },
    productName: {
      fontSize: '0.95rem',
      fontWeight: '500',
      marginBottom: '2px'
    },
    productStrain: {
      fontSize: '0.85rem',
      color: '#6c757d'
    },
    productPrice: {
      fontSize: '1rem',
      fontWeight: '600'
    },
    salePrice: {
      color: '#dc3545',
      fontWeight: '600'
    },
    originalPrice: {
      textDecoration: 'line-through',
      color: '#6c757d',
      fontSize: '0.9rem'
    },
    slideInImage: {
      width: '120px',
      height: '120px',
      objectFit: 'cover',
      borderRadius: '6px',
      marginBottom: '15px'
    },
    editButton: {
      position: 'absolute',
      right: '5px',
      top: '5px',
      padding: '4px 8px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Search Section */}
      <div style={styles.searchSection}>
        <div className="d-flex justify-content-between align-items-center">
          <InputGroup style={styles.searchInput}>
            <FormControl
              placeholder="Search by brand or product name"
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          <Button
            variant="outline-primary"
            className="rounded-circle"
            onClick={handleRefresh}
            style={styles.refreshButton}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
        </div>
      </div>

      {/* Product Categories and Lists */}
      {Object.keys(filteredInventory).map((category) => (
        <div key={category}>
          <h4 style={styles.categoryHeader}>{category}</h4>
          <ListGroup variant="flush">
            {filteredInventory[category].map((product) => (
              <ListGroup.Item
                key={product._id}
                onClick={() => handleRowClick(product)}
                style={{
                  ...styles.productItem,
                  opacity: product.status === 'Disabled' ? 0.5 : 1
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={product.variation?.image}
                      alt={product.name}
                      className="me-3"
                      style={styles.productImage}
                    />
                    <div>
                      <div style={styles.productName}>
                        <span className="fw-bold">{product.brand}</span>
                        {' | '}
                        <span>{product.variation?.amount}</span>
                      </div>
                      <div style={styles.productName}>{product.name}</div>
                      {product.variation?.strain && (
                        <div style={styles.productStrain}>{product.variation.strain}</div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    {product.status === 'Disabled' && (
                      <Badge bg="warning" className="me-2">Disabled</Badge>
                    )}
                    {product.variation?.salePrice ? (
                      <div className="text-end">
                        <div style={styles.salePrice}>
                          {formatter.format(product.variation.salePrice)}
                        </div>
                        <div style={styles.originalPrice}>
                          {formatter.format(product.variation.price)}
                        </div>
                      </div>
                    ) : (
                      <span style={styles.productPrice}>
                        {formatter.format(product.variation?.price)}
                      </span>
                    )}
                    <i className="bi bi-chevron-right ms-3"></i>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      ))}

      {/* Product Details Slide-in */}
      {selectedProduct && (
        <Offcanvas show={showSlideIn} onHide={() => setShowSlideIn(false)} placement="end">
          <Offcanvas.Header closeButton className="border-bottom">
            <Offcanvas.Title>Update Product</Offcanvas.Title>
            <Button
              variant={selectedProduct.status === 'Active' ? 'outline-danger' : 'outline-success'}
              size="sm"
              className="ms-3"
              onClick={handleStatusToggle}
            >
              {selectedProduct.status === 'Active' ? 'Disable' : 'Activate'}
            </Button>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-4">
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img
                  src={selectedProduct.variation?.image}
                  alt={selectedProduct.name}
                  style={styles.slideInImage}
                />
                <Button
                  variant="light"
                  size="sm"
                  style={styles.editButton}
                  onClick={() => setShowImageModal(true)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
              </div>
              <h5 className="mt-3 mb-1">{selectedProduct.name}</h5>
              {selectedProduct.variation?.strain && (
                <p className="text-muted mb-2">{selectedProduct.variation.strain}</p>
              )}
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                {selectedProduct.description || 'No Description'}
              </p>
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={updatedDetails.price}
                  onChange={(e) => setUpdatedDetails({ ...updatedDetails, price: e.target.value })}
                  placeholder="Enter price"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sale Price (Optional)</Form.Label>
                <Form.Control
                  type="number"
                  value={updatedDetails.salePrice}
                  onChange={(e) => setUpdatedDetails({ ...updatedDetails, salePrice: e.target.value })}
                  placeholder="Enter sale price"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Product Tags</Form.Label>
                <div style={styles.tagsContainer}>
                  {availableTags.map((tag) => (
                    <Form.Check
                      key={tag}
                      type="checkbox"
                      id={`tag-${tag}`}
                      label={tag}
                      checked={updatedDetails.tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                  ))}
                </div>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="primary" className="flex-grow-1" onClick={handleUpdate}>
                  Save Changes
                </Button>
                <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)}>
                  Delete
                </Button>
              </div>
            </Form>
          </Offcanvas.Body>
        </Offcanvas>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this product?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Update Modal */}
      {selectedProduct && (
        <UpdateProductImage
          show={showImageModal}
          handleClose={() => setShowImageModal(false)}
          currentImage={selectedProduct.variation?.image}
          selectedProduct={selectedProduct}
          productImages={selectedProduct.images || []}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </div>
  );
};

export default InventoryComponent;