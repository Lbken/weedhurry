import React, { useContext } from 'react';
import { VendorContext } from '../context/VendorContext';
import ProductRow from './ProductRow';

const VendorProducts = () => {
  const { vendor, products, error } = useContext(VendorContext);

  if (!vendor || !vendor._id) return <div>Loading vendor products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Products for {vendor.dispensaryName}</h2>
      {products.length === 0 ? (
        <p>No products available</p>
      ) : (
        <div>
          {products.map((product) => (
            <ProductRow key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
