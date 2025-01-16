import React, { useState, useEffect, useContext } from 'react';
import { Container, ButtonGroup, Button } from 'react-bootstrap';
import ProductRow from './ProductRow';
import { VendorContext } from '../context/VendorContext'; // Import VendorContext

const customCategoryOrder = ['Flower', 'Pre-roll', 'Vape', 'Edible', 'Extract', 'Topical', 'Merch'];

const ProductList = () => {
    const { products, error } = useContext(VendorContext); // Access products from VendorContext
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Flower'); // Default to 'Flower' category

    // Initialize filteredProducts to display only "Flower" products on first load
    useEffect(() => {
        if (products.length > 0) {
            setFilteredProducts(products.filter((product) => product.category === 'Flower'));
        }
    }, [products]); // Re-run if products array changes

    // Handle category filtering without new API requests
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setFilteredProducts(
            category === 'All'
                ? products
                : products.filter((product) => product.category === category)
        );
    };

    return (
        <Container className="my-4">
            <h2>Product List</h2>
            {error && <p className="text-danger">{error}</p>}

            {/* Category Filter Buttons */}
            <ButtonGroup className="d-flex overflow-auto mb-3">
                {customCategoryOrder.map((category) => (
                    <Button
                        key={category}
                        variant="outline-secondary"
                        active={selectedCategory === category}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </Button>
                ))}
            </ButtonGroup>

            {/* Product Display */}
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                    <ProductRow key={product.productId} product={product} />
                ))
            ) : (
                <p>No products available</p>
            )}
        </Container>
    );
};

export default ProductList;
