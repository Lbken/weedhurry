import React, { useState, useRef } from 'react';
import { Offcanvas, Button, Spinner } from 'react-bootstrap';
import api from '../api/api';  // Update path as needed

const UpdateProductImage = ({ 
  show, 
  handleClose, 
  currentImage,
  selectedProduct, 
  productImages = [], 
  onImageUpdate 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (imageUrl) => {
    setSelectedImage(imageUrl);
    setUploadedImage(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPEG and PNG files are allowed.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
      setSelectedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageDataUrl) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Set canvas size to 800x800
        canvas.width = 800;
        canvas.height = 800;

        // Calculate dimensions to maintain aspect ratio
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (img.width > img.height) {
          sourceX = (img.width - img.height) / 2;
          sourceWidth = img.height;
        } else {
          sourceY = (img.height - img.width) / 2;
          sourceHeight = img.width;
        }

        // Draw and crop image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, 800, 800
        );

        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          0.4 // 40% quality
        );
      };
      img.onerror = reject;
      img.src = imageDataUrl;
    });
  };

  const handleUpdate = async () => {
    if (!selectedImage && !uploadedImage) return;
  
    setIsLoading(true);
    try {
      let imageUrl;
  
      if (uploadedImage) {
        // Process image
        const processedBlob = await processImage(uploadedImage);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', processedBlob, 'product-image.jpg');
  
        try {
          // Upload to S3 via your backend
          const uploadResponse = await api.post('/api/vendor/inventory/upload-product-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
  
          imageUrl = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Failed to upload image. Please try again.');
        }
      } else {
        // Use selected existing image
        imageUrl = selectedImage;
      }
  
      // Update product with new image URL
      const updateResponse = await api.put(
        `/api/vendor/inventory/${selectedProduct._id}`,
        {
          variation: {
            ...selectedProduct.variation,
            image: imageUrl,
            price: selectedProduct.variation.price,
            amount: selectedProduct.variation.amount,
            strain: selectedProduct.variation.strain,
            tags: selectedProduct.variation.tags || [],
          }
        }
      );
  
      if (updateResponse.data.updatedProduct) {
        onImageUpdate(imageUrl);
        handleClose();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product image:', error);
      alert('Failed to update product image. ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };


  // Reset state when modal closes
  const handleOnHide = () => {
    setSelectedImage(null);
    setUploadedImage(null);
    handleClose();
  };

  return (
    <Offcanvas show={show} onHide={handleOnHide} placement="end" style={{ zIndex: 1050 }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Update Product Image</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {/* Current Image Preview */}
        <div className="text-center mb-4">
          <h6 className="mb-2">Current Image</h6>
          <img
            src={currentImage}
            alt="Current"
            className="rounded"
            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
          />
        </div>

        {/* Available Images Scroll */}
        {productImages.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-2">Select Existing Image</h6>
            <div 
              className="d-flex gap-3 overflow-auto py-2"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {productImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => handleImageSelect(img)}
                  className={`flex-shrink-0 ${selectedImage === img ? 'border border-primary' : ''}`}
                  style={{ 
                    cursor: 'pointer',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <img
                    src={img}
                    alt={`Option ${index + 1}`}
                    className="rounded"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Image Section */}
        <div className="mb-4">
          <Button
            variant="outline-primary"
            className="w-100 mb-3"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload New Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
          />
          
          {/* Upload Preview */}
          {uploadedImage && (
            <div className="text-center">
              <h6 className="mb-2">Upload Preview</h6>
              <img
                src={uploadedImage}
                alt="Upload preview"
                className="rounded"
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          <div className="d-flex gap-3">
            <Button 
              variant="primary" 
              className="w-100"
              onClick={handleUpdate}
              disabled={isLoading || (!selectedImage && !uploadedImage)}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                'Update Image'
              )}
            </Button>
            <Button 
              variant="secondary" 
              className="w-100"
              onClick={handleOnHide} 
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default UpdateProductImage;