import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductRow from './ProductRow';

const MenuDisplay = ({ products, vendorName, logoUrl, vendorId, orderType }) => {
  const [viewType, setViewType] = useState({}); // Store view type for each category ('card' or 'row')

  if (!products || products.length === 0) {
    return <p>No products available.</p>; // Handle empty or undefined products
  }

  // Step 1: Sort products so products with salePrice appear first
  const sortedProducts = [...products].sort((a, b) => {
    const aHasSalePrice = a?.salePrice != null;
    const bHasSalePrice = b?.salePrice != null;

    // Products with salePrice come first
    if (aHasSalePrice && !bHasSalePrice) return -1;
    if (!aHasSalePrice && bHasSalePrice) return 1;
    return 0; // Maintain order otherwise
  });

  // Step 2: Group sorted products by category
  const productsByCategory = sortedProducts.reduce((categories, product) => {
    const category = product.category || 'Uncategorized'; // Default to 'Uncategorized' if no category
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(product);
    return categories;
  }, {});

  const toggleViewType = (category) => {
    setViewType((prev) => ({
      ...prev,
      [category]: prev[category] === 'row' ? 'card' : 'row',
    }));
  };

  return (
    <div
      style={{
        backgroundColor: '#FFF',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {Object.keys(productsByCategory).map((category) => (
        <div key={category} style={{ marginBottom: '2rem' }}>
          {/* Category Heading with Toggle Button */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5
              style={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                borderBottom: '2px solid #ddd',
                paddingBottom: '0.5rem',
                margin: 0,
              }}
            >
              {category}
            </h5>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => toggleViewType(category)}
              style={{ fontSize: '0.8rem', position: 'relative', top: '-3px', }}
            >
              {viewType[category] === 'row' ? 'View as Cards' : 'View as Rows'}
            </button>
          </div>

          {/* Products Display */}
          {viewType[category] === 'row' ? (
            // ProductRow View
            <div>
              {productsByCategory[category].map((product) => (
                <ProductRow
                  key={`${product._id}-row`}
                  product={product}
                  vendorName={vendorName}
                  logoUrl={logoUrl}
                  vendorId={vendorId}
                  orderType={orderType}
                />
              ))}
            </div>
          ) : (
            // ProductCard Carousel View
            <div className="d-flex overflow-auto" style={{ paddingBottom: '10px', scrollbarWidth: 'thin' }}>
              {productsByCategory[category].map((product) => (
                <div
                  key={`${product._id}-${product.strain}-${product.amount}`} // Ensure unique key
                  className="me-2"
                  style={{ minWidth: '200px', flex: '0 0 auto' }}
                >
                  <ProductCard
                    product={product}
                    vendorName={vendorName}
                    logoUrl={logoUrl}
                    vendorId={vendorId}
                    orderType={orderType}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuDisplay;
