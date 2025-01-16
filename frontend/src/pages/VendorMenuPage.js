import React, { useContext, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { VendorProvider, VendorContext } from '../context/VendorContext';
import VendorDetails from '../components/VendorDetails';
import MenuDisplay from '../components/MenuDisplay';
import CategoryFilter from '../components/CategoryFilter';
import Footer from '../components/Footer';
import './VendorMenuPage.css';

const VendorMenuPage = () => {
  const { vendorId } = useParams();
  return (
    <VendorProvider vendorId={vendorId}>
      <VendorMenuContent />
    </VendorProvider>
  );
};

const VendorMenuContent = () => {
  const { vendor, products, loading, error } = useContext(VendorContext);
  const { state } = useLocation();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    sativa: false,
    hybrid: false,
    indica: false,
  });
  const [orderType, setOrderType] = useState(state?.initialOrderType || 'Delivery');
  const [animate, setAnimate] = useState(false);

  // Combined filtering with preserved product properties
  useEffect(() => {
    if (!products?.length) return;

    let updatedProducts = products.map(product => ({
      ...product, // Preserve all original properties including tags
      // Only override fields that need normalization
      description: product.description,
      strain: product.strain || 'N/A',
      thcContent: product.thcContent || null,
      price: product.price || 0,
      salePrice: product.salePrice || null,
      image: product.image || "/placeholder-image.png",
      amount: product.amount || 'N/A',
      status: product.status,
      vendorId: vendor?._id,
    }));

    console.log('Normalized products:', updatedProducts);

    // Apply category filter
    if (selectedCategory !== 'All') {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply strain classification filters
    const activeClassifications = Object.entries(activeFilters)
      .filter(([_, isActive]) => isActive)
      .map(([classification]) => classification.toLowerCase());

    if (activeClassifications.length > 0) {
      updatedProducts = updatedProducts.filter((product) => {
        const strain = (product.strain || '').toLowerCase();
        return activeClassifications.some((filter) => {
          if (filter === 'sativa') return strain.includes('sat');
          if (filter === 'hybrid') return strain.includes('hyb');
          if (filter === 'indica') return strain.includes('ind');
          return false;
        });
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      updatedProducts = updatedProducts.filter((product) =>
        [product.name, product.brand, product.strain]
          .filter(Boolean)
          .some((field) =>
            field.toLowerCase().includes(searchTerm.trim().toLowerCase())
          )
      );
    }

    console.log('Final filtered products:', updatedProducts);
    setFilteredProducts(updatedProducts);
    
  }, [products, selectedCategory, activeFilters, searchTerm, vendor?._id]);

  // Animation effect
  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleCategoryChange = (category) => setSelectedCategory(category);
  const handleSearch = (term) => setSearchTerm(term);
  const handleFilter = (filters) => setActiveFilters(filters);

  if (error) return <div>Error: {error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div
      className={`vendor-menu-page ${animate ? 'slide-in' : ''}`}
      style={{
        backgroundColor: '#F8F9FA',
        minHeight: '100vh',
        padding: '0px',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div className="shared-card">
        <VendorDetails 
          vendor={vendor} 
          orderType={orderType} 
          setOrderType={setOrderType} 
        />
        
        <div className='category-filter'>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onSearch={handleSearch}
            onFilter={handleFilter}
          />
        </div>

        <MenuDisplay
          products={filteredProducts}
          vendorName={vendor?.dispensaryName}
          logoUrl={vendor?.logoUrl}
          vendorId={vendor?._id}
          orderType={orderType}
        />
      </div>
      <Footer />
    </div>
  );
};

export default VendorMenuPage;